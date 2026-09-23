import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import re
import os
import functools

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class LiveBridgeHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        if parsed.path == '/api/bridge-status':
            resp = json.dumps({
                "status": "online", 
                "bridge": "Active Real-Time Bridge",
                "port": PORT
            }).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(resp)))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(resp)
            return

        if parsed.path == '/api/live-wuolah':
            self.handle_live_wuolah(parsed.query)
            return
            
        super().do_GET()

    def handle_live_wuolah(self, query_string):
        params = urllib.parse.parse_qs(query_string)
        slug = params.get('slug', ['matematica-discreta'])[0]
        course = params.get('course', ['1'])[0]
        community_id = params.get('communityId', ['13891'])[0]
        
        url = f"https://wuolah.com/apuntes/{slug}?communityId={community_id}&f_course={course}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            html = urllib.request.urlopen(req, timeout=12).read().decode('utf-8')
            match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html)
            if match:
                data = json.loads(match.group(1))
                queries = data.get("props", {}).get("pageProps", {}).get("dehydratedState", {}).get("queries", [])
                items = []
                for q in queries:
                    qk = q.get('queryKey')
                    if isinstance(qk, list) and len(qk) > 0 and isinstance(qk[0], dict):
                        if qk[0].get('id') == 'find-subject-artifacts':
                            state_data = q.get('state', {}).get('data', {})
                            pages = state_data.get('pages', [])
                            if pages and isinstance(pages[0], dict):
                                items = pages[0].get('items', [])
                                break
                            
                formatted = []
                for it in items:
                    meta = it.get("metadata") or {}
                    doc_slug = it.get("slug") or meta.get("documentSlug")
                    doc_id = it.get("entityId") or meta.get("documentId")
                    if not doc_slug and doc_id:
                        doc_slug = f"doc-{doc_id}"
                    
                    doc_url = f"https://wuolah.com/apuntes/{slug}/{doc_slug}" if doc_slug else url
                    stats = it.get("stats") or {}
                    
                    downloads = stats.get("numDownloads", 0)
                    bookmarks = stats.get("numBookmarks", 0)
                    views = stats.get("numViews", 0)
                    rating = 5.0 if bookmarks > 0 else (4.9 if downloads > 10 else 4.8)
                    
                    formatted.append({
                        "id": str(doc_id or it.get("id")),
                        "title": it.get("title", "Sin título"),
                        "wuolahUrl": doc_url,
                        "uploader": it.get("profile", {}).get("nickname", "Comunidad Wuolah"),
                        "downloads": downloads,
                        "views": views,
                        "bookmarks": bookmarks,
                        "rating": rating,
                        "pages": it.get("numPages") or 1,
                        "type": it.get("entitySubtype", "apuntes"),
                        "description": (it.get("comments") or "").strip() or f"Material oficial para {slug} en la UMA.",
                        "isFree": True,
                        "createdAt": it.get("createdAt")
                    })
                    
                formatted.sort(key=lambda x: (x["downloads"] * 3) + (x["bookmarks"] * 8) + (x["views"] * 1), reverse=True)
                
                body = json.dumps({
                    "success": True, 
                    "slug": slug, 
                    "course": course,
                    "count": len(formatted), 
                    "items": formatted
                }, ensure_ascii=False).encode('utf-8')
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(body)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(body)
                return
        except Exception as e:
            err_body = json.dumps({"success": False, "error": str(e)}).encode('utf-8')
            self.send_response(500)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(err_body)))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(err_body)

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    handler = functools.partial(LiveBridgeHandler, directory=DIRECTORY)
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Servidor Puente Activo en http://localhost:{PORT}")
        httpd.serve_forever()
