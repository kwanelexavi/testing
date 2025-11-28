from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
import uuid

app = Flask(__name__)
# CORS is crucial! It allows the React app (running on a different port) 
# to talk to this server.
CORS(app) 

# --- In-Memory Database ---
posts = [
    {
      'id': '1',
      'author': 'Sarah Jenkins',
      'content': 'Recovery is not a straight line. Some days are harder than others, but finding a community that understands has been my saving grace.',
      'timestamp': datetime.datetime.now().isoformat(),
      'likes': 24,
      'comments': [
        {'id': 'c1', 'author': 'Mike T.', 'content': 'Thank you for sharing this.', 'timestamp': datetime.datetime.now().isoformat()}
      ]
    },
    {
      'id': '2',
      'author': 'Anonymous',
      'content': 'Today marks one year since I left my abusive situation. Freedom is worth every struggle.',
      'timestamp': datetime.datetime.now().isoformat(),
      'likes': 156,
      'comments': []
    }
]
reports = []

# --- Routes ---

@app.route('/api/posts/', methods=['GET'])
def get_posts():
    return jsonify(posts)

@app.route('/api/posts/', methods=['POST'])
def create_post():
    data = request.json
    new_post = {
        'id': str(uuid.uuid4()),
        'author': data.get('author', 'Anonymous'),
        'content': data.get('content'),
        'timestamp': datetime.datetime.now().isoformat(),
        'likes': 0,
        'comments': []
    }
    posts.insert(0, new_post)
    return jsonify(posts)

@app.route('/api/posts/<post_id>/like/', methods=['POST'])
def like_post(post_id):
    for post in posts:
        if post['id'] == post_id:
            post['likes'] += 1
            break
    return jsonify(posts)

@app.route('/api/posts/<post_id>/comments/', methods=['POST'])
def add_comment(post_id):
    data = request.json
    for post in posts:
        if post['id'] == post_id:
            new_comment = {
                'id': str(uuid.uuid4()),
                'author': data.get('author', 'User'),
                'content': data.get('content'),
                'timestamp': datetime.datetime.now().isoformat()
            }
            post['comments'].append(new_comment)
            break
    return jsonify(posts)

@app.route('/api/reports/', methods=['POST'])
def create_report():
    data = request.json
    report_entry = {
        'id': str(uuid.uuid4()),
        'received_at': datetime.datetime.now().isoformat(),
        'data': data
    }
    reports.append(report_entry)
    print(f"⚠️ NEW REPORT RECEIVED: {report_entry}")
    return jsonify({'status': 'success', 'report_id': report_entry['id']})

if __name__ == '__main__':
    print("Starting Flask Server on port 5000...")
    app.run(port=5000, debug=True)