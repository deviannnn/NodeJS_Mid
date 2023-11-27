function init() {
    window.accountAPI.getAll()
        .then((response) => {
            if (response.success) {
                const accounts = response.accounts.map(account => account._doc);
                displayAccounts(accounts);
            } else {
                $('#message-modal-fail').text(response.message)
                $('#failModal').modal('show');
            }
        })
        .catch((error) => {
            $('#message-modal-fail').text('Somethings went wrong. Please try again later!')
            $('#failModal').modal('show');
        });
}

function displayAccounts(accounts) {
    const tableBody = $('tbody');

    tableBody.empty();

    accounts.forEach(account => {
        const row = $('<tr>');
        row.append(`
        <td>
            <div class="d-flex py-1">
                <div>
                    <img src="../assets/uploads/account/${account.avatar}" class="avatar avatar-sm me-3" ">
                </div>
                <div class="d-flex flex-column justify-content-center">
                    <h6 h6 class="mb-0 text-sm">${account.name}</h6>
                    <p class="text-xs text-secondary mb-0">${account.email}</p>
                    </div>
            </div>
        </td>`);
        row.append(`<td><span class="badge badge-sm ${getBadgeClass(account.status)}">${account.status}</span></td>`);
        row.append(`<td><span class="text-secondary text-xs font-weight-bold">${formatDate(account.created)}</span></td>`);

        if (isAdmin) {
            row.append(`<td><span class="mt-3 badge btn lock badge-sm ${getBadgeClass(account.lock)}">${account.lock ? 'locked' : 'nolocked'}</span></td>`);
            row.append(`
            <td>
                <button type="button" class="action-btn detail"><i class="fas fa-eye text-secondary" aria-hidden="true"></i></button>
                <button type="button" class="action-btn edit"><i class="fas fa-pen-square text-secondary" aria-hidden="true"></i></button>
                <button type="button" class="action-btn delete"><i class="fas fa-trash text-secondary" aria-hidden="true"></i></button>
            </td>`);
        } else {
            row.append(`<td><span class="badge badge-sm ${getBadgeClass(account.lock)}">${account.lock ? 'locked' : 'nolocked'}</span></td>`);
            row.append('<td><button type="button" class="action-btn detail"><i class="fas fa-eye text-secondary" aria-hidden="true"></i></button></td>');
        }

        tableBody.append(row);
    });

    $('#example2').DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": false,
        "ordering": true,
        "info": true,
        "autoWidth": false,
    });
}

// Handler
let currentEmail = '';
$('tbody').on('click', '.detail, .edit, .delete, .lock', function () {
    const row = $(this).closest('tr');
    currentEmail = row.find('td:eq(0) p').text();

    switch (true) {
        case $(this).hasClass('detail'):
            getAndShowAccount('detail');
            break;

        case $(this).hasClass('edit'):
            getAndShowAccount('edit');
            break;

        case $(this).hasClass('lock'):
            getAndShowAccount('lock');
            break;

        case $(this).hasClass('delete'):
            getAndShowAccount('delete');
            break;

        default:
            break;
    }
});

let currentStaffId = '';
function getAndShowAccount(modal) {
    if (currentEmail !== '') {
        window.accountAPI.get(currentEmail)
            .then((response) => {
                if (response.success) {
                    const account = response.account._doc;
                    currentStaffId = account.staffId;
                    if (modal === 'detail') {
                        displayAccountDetail(account);
                    } else if (modal === 'edit') {
                        displayAccountEdit(account);
                    } else if (modal === 'lock') {
                        displayAccountLock(account);
                    } else if (modal === 'delete') {
                        $('.del-name-account').text(`(${account.name})`);
                        $('#deleteModal').modal('show');
                    }
                } else {
                    $('#message-modal-fail').text(response.message)
                    $('#failModal').modal('show');
                }
            })
            .catch((error) => {
                $('#message-modal-fail').text('Somethings went wrong. Please try again later!')
                $('#failModal').modal('show');
            });
    } else {
        $('#message-modal-fail').text('No account has been selected to see detail yet.')
        $('#failModal').modal('show');
    }
}

// Delete module
$('#confirm-del-btn').on('click', onConfirmDelButtonClick);

function onConfirmDelButtonClick() {
    if (currentStaffId !== '') {
        window.accountAPI.delete(currentStaffId)
            .then((response) => {
                if (response.success) {
                    $('#modal-success-title').text(response.title);
                    $('#modal-success-msg').text(response.message);
                    $('#successModal').modal('show');
                } else {
                    $('#message-modal-fail').text(response.message)
                    $('#failModal').modal('show');
                }
            })
            .catch((error) => {
                $('#message-modal-fail').text('Somethings went wrong. Please try again later!')
                $('#failModal').modal('show');
            });
    } else {
        $('#message-modal-fail').text('No account has been selected to delete yet.')
        $('#failModal').modal('show');
    }
}

// Lock/Unlock module
function displayAccountLock(account) {
    $('.lock-name').text(account.name);
    $('.lock-gender').text(`${account.gender === 'male' ? 'he' : 'she'}`);
    if (account.lock) {
        $('#unlock-msg').show();
        $('#lock-msg').hide();
    } else {
        $('#unlock-msg').hide();
        $('#lock-msg').show();
    }

    $('#toggleLockModal').modal('show');
}

$('#confirm-lock-btn').on('click', onConfirmLockButtonClick);

async function onConfirmLockButtonClick() {
    if (currentStaffId !== '') {
        window.accountAPI.toggleLock(currentStaffId)
            .then((response) => {
                if (response.success) {
                    $('#modal-success-title').text(response.title);
                    $('#modal-success-msg').text(response.message);
                    $('#successModal').modal('show');
                } else {
                    $('#message-modal-fail').text(response.message)
                    $('#failModal').modal('show');
                }
            })
            .catch((error) => {
                $('#message-modal-fail').text('Somethings went wrong. Please try again later!')
                $('#failModal').modal('show');
            });
    } else {
        $('#message-modal-fail').text('No account has been selected to lock/unlock yet.')
        $('#failModal').modal('show');
    }
}

// Detail module
function displayAccountDetail(account) {
    $('#detail-img-account').attr('src', `../assets/uploads/account/${account.avatar}`);
    $('#detail-id-account').text(account.staffId);
    $('#detail-name-account').text(account.name);
    $('#detail-email-account').text(account.email);
    $('#detail-phone-account').text(account.phone);
    $('#detail-gender-account').text(account.gender);
    $('#detail-birthday-account').text(formatDate(account.birthday));
    $('#detail-address-account').text(`${account.address.num} ${account.address.street}, Ward ${account.address.ward}, District ${account.address.district}, ${account.address.city} City.`);
    $('#detail-role-account').text(account.role).removeClass().addClass(`pt-2 badge badge-sm ${getBadgeClass(account.role)}`);;
    $('#detail-status-account').text(account.status).removeClass().addClass(`pt-2 badge badge-sm ${getBadgeClass(account.status)}`);
    $('#detail-locked-account').text(`${account.lock ? 'locked' : 'nolock'}`).removeClass().addClass(`pt-2 badge badge-sm ${getBadgeClass(account.lock)}`);
    $('#detail-created-account').text(formatDateTime(account.created));
    $('#detail-updated-account').text(formatDateTime(account.updated));

    $('#detailModal').modal('show');
}

// Edit module
let currentPhone = '';
function displayAccountEdit(account) {
    currentPhone = account.phone;

    $('#gender option').each(function () {
        if ($(this).val() === account.gender) {
            $(this).prop('selected', true);
        } else {
            $(this).prop('selected', false);
        }
    });
    $('#name').val(account.name);
    $('#email').val(account.email);
    $('#phone').val(account.phone);
    $('#date').val(formatForBirthdayInput(account.birthday));
    $('#num').val(account.address.num);
    $('#street').val(account.address.street);
    $('#ward').val(account.address.ward);
    $('#district').val(account.address.district);
    $('#city').val(account.address.city);

    validateAllFields()
    $('#editModal').modal('show');
}

$('#confirm-edit-btn').on('click', onConfirmEditButtonClick);

$('#next-edit-btn').on('click', onNextEditButtonClick);

async function onConfirmEditButtonClick() {
    const isValid = await validateAllFields();
    if (isValid) {
        const data = {
            staffId: currentStaffId,
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

        window.accountAPI.edit(data)
            .then((response) => {
                if (response.success) {
                    $('#modal-success-title').text(response.title);
                    $('#modal-success-msg').text(response.message);
                    $('#successModal').modal('show');
                } else {
                    $('#message-modal-fail').text(response.message)
                    $('#failModal').modal('show');
                }
            })
            .catch((error) => {
                $('#message-modal-fail').text('Somethings went wrong. Please try again later!')
                $('#failModal').modal('show');
            });
    } else {
        $('#message-modal-fail').text('No account has been selected to edit yet.')
        $('#failModal').modal('show');
    }
}

async function onNextEditButtonClick() {
    const isValid = await validateAllFields();
    if (isValid) {
        $('#verifyEditModal').modal('show');
    } else {
        $('#message-modal-fail').text('Please correct invalid fields')
        $('#failModal').modal('show');
    }
}

$('#name, #email, #date, #phone, #num, #street, #ward, #district, #city').on('input', function () {
    validateInput($(this));
});

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
        if (check && value !== currentEmail) {
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
        if (check && value !== currentPhone) {
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

// Utils
function getBadgeClass(status) {
    switch (status) {
        case 'actived':
            return 'bg-gradient-success';
        case 'inactived':
            return 'bg-gradient-secondary';
        case 'admin':
            return 'badge-warning';
        case 'staff':
            return 'badge-primary';
        case true:
            return 'bg-gradient-danger';
        case false:
            return 'bg-gradient-info';
        default:
            return 'badge-secondary';
    }
}

function formatDate(dateString) {
    const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', options).format(date);
}

function formatForBirthdayInput(birthdayStr) {
    const year = birthdayStr.getFullYear();
    const month = String(birthdayStr.getMonth() + 1).padStart(2, '0');
    const day = String(birthdayStr.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatDateTime(dateString) {
    const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', options);
}

$(document).ready(init);