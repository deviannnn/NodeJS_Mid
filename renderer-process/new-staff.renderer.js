$('#name, #email, #date, #phone, #num, #street, #ward, #district, #city').on('input', function () {
    validateInput($(this));
});

$('#next-btn').on('click', onNextButtonClick);

$('#confirm-btn').on('click', onConfirmButtonClick);

async function onNextButtonClick() {
    const isValid = await validateAllFields();
    if (isValid) {
        $('#verifymodal').modal('show');
    } else {
        $('#message-modal-fail').text('Please correct invalid fields')
        $('#failModal').modal('show');
    }
}

async function onConfirmButtonClick() {
    console.log(getValue('#date'))
    const isValid = await validateAllFields();
    if (isValid) {
        const data = {
            email: getValue('#email'),
            name: getValue('#name'),
            gender: getValue('#gender'),
            birthday: getValue('#date'),
            phone: getValue('#phone'),
            num: getValue('#num'),
            street: getValue('#street'),
            ward: getValue('#ward'),
            district: getValue('#district'),
            city: getValue('#city'),
        };

        window.accountAPI.add(data)
            .then((response) => {
                if (response.success) {
                    $('#successModal').modal('show');
                } else {
                    $('#message-modal-fail').text(response.message)
                    $('#failModal').modal('show');
                }
            })
            .catch((error) => {
                $('#message-modal-fail').text('Something went wrong. Please try again later!')
                $('#failModal').modal('show');
            });
    } else {
        $('#message-modal-fail').text('Please correct invalid fields')
        $('#failModal').modal('show');
    }
}

async function validateAllFields() {
    const fields = ['#name', '#email', '#date', '#phone', '#num', '#street', '#ward', '#district', '#city'];
    let countError = 0;
    for (const field of fields) {
        const check = await validateInput($(field));
        if (check === false) {
            countError++;
        }
    }
    if (countError > 0) {
        return false;
    }
    return true;
}

async function validateInput(input) {
    const value = input.val().trim();

    const showError = (errId, errMsg) => {
        $(errId).text(errMsg).show();
        input.removeClass('is-valid').addClass('is-invalid');
        return false;
    };

    const showSuccess = (errId) => {
        $(errId).hide();
        input.removeClass('is-invalid').addClass('is-valid');
        return true;
    };

    if (input.is('#email')) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return showError('#email-err', '(invalid email)');
        }

        const check = await existEmail(value);
        if (check) {
            return showError('#email-err', '(existed email)');
        }

        return showSuccess('#email-err');
    }

    if (input.is('#phone')) {
        if (!/^\d+$/.test(value)) {
            return showError('#phone-err', '(invalid phone)');
        }
        if (value.length > 11) {
            return showError('#phone-err', '(too long)');
        }

        const check = await existPhone(value);
        if (check) {
            return showError('#phone-err', '(existed phone)');
        }

        return showSuccess('#phone-err');
    }

    if (input.is('#name')) {
        if (!/^[a-zA-Z\s]+$/.test(value)) {
            return showError('#name-err', '(invalid name)');
        }
        return showSuccess('#name-err');
    }

    if (input.is('#date') || input.is('#num') || input.is('#street') || input.is('#ward') || input.is('#district') || input.is('#city')) {
        if (!value) {
            return showError(`#${input.attr('id')}-err`, `(invalid ${input.attr('id')})`);
        }
        return showSuccess(`#${input.attr('id')}-err`);
    }
}

async function existEmail(email) {
    try {
        const response = await window.accountAPI.checkEmail(email);
        return response.exists;
    } catch (error) {
        console.error('Error calling check email API:', error);
        return false;
    }
}

async function existPhone(phone) {
    try {
        const response = await window.accountAPI.checkPhone(phone);
        return response.exists;
    } catch (error) {
        console.error('Error calling check phone API:', error);
        return false;
    }
}

function getValue(selector) {
    return $(selector).val().trim();
}

$(document).ready(init);