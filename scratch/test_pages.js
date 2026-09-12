const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const pages = ['page-home', 'page-about', 'page-leadership', 'page-resources', 'page-training', 'page-innovations', 'page-gallery', 'page-contact'];
pages.forEach(p => console.log(p + ' exists:', html.includes('id="' + p + '"')));
console.log('Old modal subpageModal_about exists:', html.includes('subpageModal_about'));
console.log('Footer exists:', html.includes('vijay-site-footer'));
console.log('Login modal exists:', html.includes('loginModal'));
console.log('Admin view exists:', html.includes('adminView'));
