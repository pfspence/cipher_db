#!/usr/local/bin/python
# import the necessary packages
from skimage import measure
# from skimage.measure import structural_similarity
import matplotlib.pyplot as plt
import numpy as np
import cv2
import os

class Score(object):
    def __init__(self, path, cipher_name, character, mse_score, ssim_score):
        self.path = path
        self.cipher_name = cipher_name
        self.character = character
        self.mse_score = mse_score
        self.ssim_score = ssim_score
        self.score = abs(mse_score / ssim_score)

def mse(imageA, imageB):
	# the 'Mean Squared Error' between the two images is the
	# sum of the squared difference between the two images;
	# NOTE: the two images must have the same dimension
	err = np.sum((imageA.astype("float") - imageB.astype("float")) ** 2)
	err /= float(imageA.shape[0] * imageA.shape[1])
	
	# return the MSE, the lower the error, the more "similar"
	# the two images are
	return err

# def compare_images(imageA, imageB, title):
# 	# compute the mean squared error and structural similarity
# 	# index for the images
# 	m = mse(imageA, imageB)
# 	s = ssim(imageA, imageB)

# 	# setup the figure
# 	fig = plt.figure(title)
# 	plt.suptitle("MSE: %.2f, SSIM: %.2f" % (m, s))

# 	# show first image
# 	ax = fig.add_subplot(1, 2, 1)
# 	plt.imshow(imageA, cmap = plt.cm.gray)
# 	plt.axis("off")

# 	# show the second image
# 	ax = fig.add_subplot(1, 2, 2)
# 	plt.imshow(imageB, cmap = plt.cm.gray)
# 	plt.axis("off")

# 	# show the images
# 	plt.show()
cipher_lib_dir = 'static/ciphers_lib/'
ignore_files = ['.DS_Store']

def track_scores(scores, letter_path, directory, character, mse_score, ssim_score):
	if mse_score and ssim_score:
		score = Score(letter_path, directory, character, mse_score, ssim_score)
		scores.append(score)

def get_scores(filepath):
	scores = []
	candidate_image = cv2.imread(filepath)
	candidate_image = cv2.cvtColor(candidate_image, cv2.COLOR_BGR2GRAY)
	candidate_image = cv2.resize(candidate_image, (100, 100))

	dirs = []
	files = []

	for (dirpath, dirnames, filenames) in os.walk(cipher_lib_dir):
		dirs.extend(dirnames)
		break
    
	for directory in dirs:
		for (dirpath, dirnames, filenames) in os.walk(cipher_lib_dir + directory):
			files = [file for file in filenames if file not in ignore_files]
			for file in files:
				path = cipher_lib_dir + directory + '/' + file
				if path:
					letter_image = cv2.imread(path)
					letter_image = cv2.cvtColor(letter_image, cv2.COLOR_BGR2GRAY)
					letter_image = cv2.resize(letter_image, (100, 100))
					mse_score = mse(candidate_image, letter_image)
					ssim_score = measure.compare_ssim(candidate_image, letter_image)
					track_scores(scores, path, directory, file, mse_score, ssim_score)
	scores = sorted(scores, key=lambda score: score.score)
	return scores[0:15]

#load images



#load images
# a = cv2.imread("webapp/ciphers_lib/moon_type/a.png")
# b = cv2.imread("webapp/ciphers_lib/moon_type/b.png")
# c = cv2.imread("webapp/ciphers_lib/moon_type/c.png")
# h = cv2.imread("webapp/ciphers_lib/moon_type/h.png")

# font1 = cv2.imread("test/font1.png")

# convert to grayscale
# a = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY)
# b = cv2.cvtColor(b, cv2.COLOR_BGR2GRAY)
# c = cv2.cvtColor(c, cv2.COLOR_BGR2GRAY)
# h = cv2.cvtColor(h, cv2.COLOR_BGR2GRAY)

# font1 = cv2.cvtColor(font1, cv2.COLOR_BGR2GRAY)

# a = cv2.resize(a, (100, 100)) 
# b = cv2.resize(b, (100, 100)) 
# c = cv2.resize(c, (100, 100)) 
# h = cv2.resize(h, (100, 100)) 
# font1 = cv2.resize(font1, (100, 100))

# initialize the figure
# fig = plt.figure("Images")
# images = ("a", a), ("b", b), ("c", c), ("h", h), ("font1", font1)

# loop over the images
# for (i, (name, image)) in enumerate(images):
# 	# show the image
# 	ax = fig.add_subplot(1, 5, i + 1)
# 	ax.set_title(name)
# 	plt.imshow(image, cmap = plt.cm.gray)
# 	plt.axis("off")

# show the figure
# plt.show()

# compare the images
# compare_images(font1, a, "a vs. font1")
# compare_images(font1, b, "b vs. font1")
# compare_images(font1, c, "c vs. font1")
# compare_images(font1, h, "h vs. font1")
