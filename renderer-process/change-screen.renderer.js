$(document).ready(function () {
    $('.change-screen').on('click', function (event) {
        event.preventDefault();
        const screen = $(this).data('screen');
        if (screen) {
            window.changeScreenAPI.goToScreen(screen);
        }
    });
});