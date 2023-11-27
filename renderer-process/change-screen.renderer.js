const loggedInAccount = JSON.parse(localStorage.getItem('loggedInAccount'));
let isAdmin = false;
if (loggedInAccount.role === 'admin') {
    isAdmin = true;
}

$(document).ready(function () {
    if (!isAdmin) {
        $('.action-for-admin').hide();
    }
    $('.account-avatar').attr('src', `../assets/uploads/account/${loggedInAccount.avatar}`);

    $('.log-out-btn').on('click', function (event) {
        event.preventDefault();
        localStorage.clear();
        window.changeScreenAPI.goToScreen('login');
    })

    $('.change-screen').on('click', function (event) {
        event.preventDefault();
        const screen = $(this).data('screen');
        if (screen) {
            window.changeScreenAPI.goToScreen(screen);
        }
    });
});