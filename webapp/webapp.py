#!/usr/local/bin/python
import os
import json
import cv2
import uuid
from compare_images import get_scores
# We'll render HTML templates and access data sent by POST
# using the request object from flask. Redirect and url_for
# will be used to redirect the user once the upload is done
# and send_from_directory will help us to send/show on the
# browser the file that the user just uploaded
from flask import Flask, Response, render_template, request, g, redirect, url_for, abort, send_from_directory, flash
from werkzeug import secure_filename, FileStorage
from sqlite3 import dbapi2 as sqlite3


class LetterFile(object):
    def __init__(self, name, path):
        self.name = name
        self.path = path

class CipherCollection(object):
    def __init__(self, name, letters):
        self.name = name
        self.letters = letters

# Initialize the Flask application
app = Flask(__name__)

# This is the path to the upload directory
app.config['UPLOAD_FOLDER'] = 'static/uploads/'
app.config['LIB_FOLDER'] = 'static/ciphers_lib/'
# These are the extension that we are accepting to be uploaded
app.config['ALLOWED_EXTENSIONS'] = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

# Override because of overlap with angular/vue double curly delimiters
jinja_options = app.jinja_options.copy()

jinja_options.update(dict(
    block_start_string='<%',
    block_end_string='%>',
    variable_start_string='%%',
    variable_end_string='%%',
    comment_start_string='<#',
    comment_end_string='#>'
))
app.jinja_options = jinja_options

app.config.update(dict(
    DATABASE=os.path.join(app.root_path, 'flaskr.db'),
    DEBUG=True,
    SECRET_KEY='development key',
    USERNAME='admin',
    PASSWORD='default'
))

# For a given file, return whether it's an allowed type or not
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']

def connect_db():
    """Connects to the specific database."""
    rv = sqlite3.connect(app.config['DATABASE'])
    rv.row_factory = sqlite3.Row
    return rv


def init_db():
    """Initializes the database."""
    db = get_db()
    with app.open_resource('schema.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()


@app.cli.command('initdb')
def initdb_command():
    """Creates the database tables."""
    init_db()
    print('Initialized the database.')


def get_db():
    """Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db


@app.teardown_appcontext
def close_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()




# ROUTES:
@app.route('/')
def index():
    #init_db()
    return redirect(url_for('listciphers'))

@app.route('/upload')
def uploadimage():
    return render_template('upload.html')

@app.route('/list')
def listciphers():
    url_for('static', filename='script.js')
    return render_template('list.html')

@app.route('/import_cipher')
def import_cipher():
    url_for('static', filename='script.js')
    return render_template('import_cipher.html')

@app.route('/detail')
def detail():
    url_for('static', filename='script.js')
    return render_template('detail.html')

@app.route('/ocr_search')
def ocr_search():
    url_for('static', filename='script.js')
    return render_template('ocr_search.html')

@app.route('/score')
def score(filepath=None):
    filepath = request.args.get('filepath', '')
    if filepath:
        font1 = cv2.imread(filepath)
        scores = get_scores(filepath)
        jsonScores = []
        for score in scores:
            jsonScores.append(json.dumps(score.__dict__))
        resp = Response(response=json.dumps(jsonScores),
            status=200, \
            mimetype="application/json")
        return(resp)
    else:
        resp = Response(response='need to supply filename',
            status=200, \
            mimetype="application/json")
        return resp

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files['file']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return app.config['UPLOAD_FOLDER'] + filename
                                

@app.route('/upload_dataurl', methods=['POST'])
def upload_dataurl():
    # file_name = uuid.uuid4().hex[0:10]
    print request.get_data()
    cipher_name = request.get_data().split('cipher=')[1].split(',')[0]
    file_name = request.get_data().split('filename=')[1].split(',')[0] + '.jpg'
    imgData = request.get_data().split('image=')[1].split(',')[1]

    if not os.path.isdir(os.path.join(app.config['UPLOAD_FOLDER'], cipher_name)):
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], cipher_name))

    cipher_path = os.path.join(app.config['UPLOAD_FOLDER'], cipher_name)
    fh = open(os.path.join(cipher_path, file_name), "wb")
    fh.write(imgData.decode('base64'))
    fh.close()

    return cipher_path + '/' + file_name
    #FileStorage(stream=request.get_data()).save(os.path.join(app.config['UPLOAD_FOLDER'],'testpic.jpg'))


# ASYNC CALLS:
@app.route('/show_entries')
def show_entries():
    db = get_db()
    cur = db.execute('select title, text from entries order by id desc')
    all_entries = cur.fetchall()

    entries_as_dict = []

    for entry in all_entries:
        entry_as_dict = {
            'title' : entry[0],
            'text' : entry[1]}
        entries_as_dict.append(entry_as_dict)

    resp = Response(response=json.dumps(entries_as_dict),
        status=200, \
        mimetype="application/json")
    return(resp)

@app.route('/add', methods=['POST'])
def add_entry():
    db = get_db()
    db.execute('insert into entries (title, text) values (?, ?)',
               [request.form['title'], request.form['text']])
    db.commit()
    flash('New entry was successfully posted')
    return redirect(url_for('show_entries'))

@app.route('/getallciphers')
def getallciphers():
    dirs = []
    filepaths = []
    files = []
    file_infos = []
    all_ciphers = []
    ignore_files = ['.DS_Store']
    for (dirpath, dirnames, filenames) in os.walk(app.config['LIB_FOLDER']):
        dirs.extend(dirnames)
        break
    
    for directory in dirs:
        for (dirpath, dirnames, filenames) in os.walk(app.config['LIB_FOLDER'] +'/' + directory):
            files = [file for file in filenames if file not in ignore_files]
            file_infos=[]
            for file in files:
                name = os.path.splitext(file)[0]
                path = directory + '/' + file
                letter_file = LetterFile(name, path)
                file_infos.append(letter_file.__dict__)
        cipher_collection = CipherCollection(directory, file_infos)
        all_ciphers.append(json.dumps(cipher_collection.__dict__))

    resp = Response(response=json.dumps(all_ciphers),
        status=200, \
        mimetype="application/json")
    return(resp)

if __name__ == '__main__':
    app.run()



