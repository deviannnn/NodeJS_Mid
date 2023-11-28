$('#sign-in-btn').on('click', () => {
    const email = $('#email').val().trim();
    const password = $('#password').val().trim();
    localStorage.setItem('welcome', true);
    window.accountAPI.login({ email, password })
        .then((response) => {
            if (!response.success) {
                $('#password').val('');
                $('#login-err').text(response.message).show();
            }
        })
        .catch((error) => {
            $('#login-err').text('Somethings went wrong. Please try again later!').show();
        });
})

$('#email, #password').on('focus', () => {
    $('#login-err').hide();
})