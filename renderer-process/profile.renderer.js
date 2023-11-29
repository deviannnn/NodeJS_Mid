async function init() {
    loggedAccount = await window.accountAPI.getLoggedAccount();

    $('#gender option').each(function () {
        if ($(this).val() === loggedAccount.gender) {
            $(this).prop('selected', true);
        } else {
            $(this).prop('selected', false);
        }
    });

    $('#display-name').text(loggedAccount.name);
    $('#display-role').text(loggedAccount.role);
    $('#name').val(loggedAccount.name);
    $('#gender').val(loggedAccount.gender);
    $('#birthday').val(formatForBirthdayInput(loggedAccount.birthday));
    $('#email').val(loggedAccount.email);
    $('#phone').val(loggedAccount.phone);
    $('#num').val(loggedAccount.address.num);
    $('#street').val(loggedAccount.address.street);
    $('#ward').val(loggedAccount.address.ward);
    $('#district').val(loggedAccount.address.district);
    $('#city').val(loggedAccount.address.city);
}

$('#update-pw-btn').click(() => {
    if (!validatePassword($('#new-pw'))) {
        $('#new-pw').removeClass('is-valid').addClass('is-invalid');
        return $('#new-pw').focus();
    }
    if (!validateConfirmPassword($('#confirm-pw'))) {
        return $('#confirm-pw').focus();
    }

    const curPassword = $('#cur-pw').val();
    const newPassword = $('#new-pw').val();

    if (curPassword.length > 0) {
        window.accountAPI.changePassword({ staffId: loggedAccount.staffId, curPassword: curPassword, newPassword: newPassword })
            .then((response) => {
                if (response.success) {
                    $('#modal-success-title').text(response.title);
                    $('#modal-success-msg').text(response.message);
                    $('#successModal').modal('show');
                } else {
                    if (response.curPwErr) {
                        $('#cur-pw').addClass('is-invalid');
                        $('#cur-pw-err').text(response.message);
                        $('#cur-pw').focus();
                    }
                }
            })
            .catch((error) => {
                $('#message-modal-fail').text('Somethings went wrong. Please try again later!')
                $('#failModal').modal('show');
            });
    } else {
        $('#cur-pw').addClass('is-invalid');
        $('#cur-pw').focus();
    }
})

$('#cur-pw').on('click, input', function () {
    $('#cur-pw').removeClass('is-invalid');
    $('#cur-pw-err').text('');
});

$('#new-pw').on('input', function () {
    $('#new-pw').removeClass('is-invalid');
    validatePassword($('#new-pw'));
});

$('#confirm-pw').on('input', function () {
    validateConfirmPassword($('#confirm-pw'));
});

function validateConfirmPassword(inputElement) {
    const confirmPassword = inputElement.val();

    if (confirmPassword !== '' && confirmPassword === $('#new-pw').val()) {
        $('#confirm-pw').removeClass('is-invalid').addClass('is-valid');
        return true;
    } else {
        $('#confirm-pw').removeClass('is-valid').addClass('is-invalid');
        return false;
    }
}

function validatePassword(inputElement) {
    const password = inputElement.val();

    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    updateValidationMessage('#pw-guild-1', hasSpecialChar);

    const hasNumber = /\d/.test(password);
    updateValidationMessage('#pw-guild-2', hasNumber);

    const hasMinLength = password.length >= 10;
    updateValidationMessage('#pw-guild-3', hasMinLength);

    if (hasSpecialChar && hasNumber && hasMinLength) {
        inputElement.removeClass('is-invalid').addClass('is-valid');
        return true;
    } else {
        inputElement.removeClass('is-valid');
        return false;
    }
}

function updateValidationMessage(elementId, isValid) {
    const element = $(elementId);

    element.removeClass('text-success text-danger');

    if (isValid) {
        element.addClass('text-success');
    } else {
        element.addClass('text-danger');
    }
}

function formatForBirthdayInput(birthdayStr) {
    const birthdayDate = new Date(birthdayStr);

    const year = birthdayDate.getFullYear();
    const month = String(birthdayDate.getMonth() + 1).padStart(2, '0');
    const day = String(birthdayDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

$(document).ready(init);