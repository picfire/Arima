from setuptools import setup, find_packages

setup(
    name='music-generation-rnn',
    version='0.1.0',
    author='Your Name',
    author_email='your.email@example.com',
    description='A project for music generation using Recurrent Neural Networks.',
    packages=find_packages(where='src'),
    package_dir={'': 'src'},
    install_requires=[
        'tensorflow>=2.0.0',
        'numpy',
        'mido',
        'pretty_midi',
        'matplotlib',
        'jupyter'
    ],
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    python_requires='>=3.6',
)