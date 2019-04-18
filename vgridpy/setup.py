from setuptools import setup

if __name__ == "__main__":
    setup(
        name='vgridpy',
        version='0.1.0',
        description='Python bindings into Vgrid objects',
        url='http://github.com/scanner-research/vgrid',
        author='David Yao, Will Crichton',
        author_email='yaodavid@stanford.edu',
        license='Apache 2.0',
        packages=['vgrid'],
        install_requires=['rekallpy'],
        zip_safe=False)
