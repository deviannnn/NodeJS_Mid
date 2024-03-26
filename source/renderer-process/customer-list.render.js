const loggedInAccount = JSON.parse(localStorage.getItem('loggedInAccount'));
let isAdmin = false;
if (loggedInAccount.role === 'admin') {
    isAdmin = true;
}

function init() {
    if (!isAdmin) {
        $('.action-for-admin').hide();
    }
}

$(document).ready(init);