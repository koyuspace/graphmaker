from bottle import get, run, post, request, response

token="b5faba27846c3bcd3164b16700d93e76"

@get("/get/<t>")
def get(t):
  response.headers['Access-Control-Allow-Origin'] = '*'
  if t == token:
    f = open("object")
    s = f.read()
    f.close()
    return s
  else:
    return ""

@post("/set")
def set():
  response.headers['Access-Control-Allow-Origin'] = '*'
  d = request.forms.get("dat")
  t = request.forms.get("token")
  if t == token:
    f = open("object", "w+")
    f.write(d)
    f.close()
    return "OK"
  else:
    return "ERR"

run(host="0.0.0.0", port=3290)
