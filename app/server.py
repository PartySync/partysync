from flask import Flask, render_template
from flask import url_for, redirect

# app = Flask(__name__)
app = Flask(__name__, static_url_path='')


@app.route("/<uname>")
def template_test(uname=None):
	# return "Yo " + uname
	return app.send_static_file('index.html')
	return render_template(url_for('static', filename='index.html'))
	# return redirect('index.html')


if __name__ == '__main__':
    app.run(debug=True)