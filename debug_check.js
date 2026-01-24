const fs = require('fs');
const content = fs.readFileSync('blog/index.html', 'utf8');
if (content.includes('why-business-needs-verified-accounts-reviews-2026')) {
    console.log("FOUND slug in blog/index.html");
} else {
    console.log("NOT FOUND slug in blog/index.html");
}

if (content.includes('Why Every Business Needs Verified Accounts')) {
    console.log("FOUND title in blog/index.html");
} else {
    console.log("NOT FOUND title in blog/index.html");
}
