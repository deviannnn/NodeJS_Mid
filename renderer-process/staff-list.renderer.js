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
            $('#message-modal-fail').text('Something went wrong. Please try again later!')
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
        row.append(`<td><span class="mt-3 badge btn lock badge-sm ${getBadgeClass(account.lock)}">${account.lock ? 'locked' : 'nolocked'}</span></td>`);
        row.append(`
        <td>
            <button type="button" class="action-btn detail"><i class="fas fa-eye text-secondary" aria-hidden="true"></i></button>
            <button type="button" class="action-btn edit"><i class="fas fa-pen-square text-secondary" aria-hidden="true"></i></button>
            <button type="button" class="action-btn delete"><i class="fas fa-trash text-secondary" aria-hidden="true"></i></button>
        </td>`);

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
        case $(this).hasClass('lock'):
            getAndShowAccount('edit');
            break;

        case $(this).hasClass('edit'):
            getAndShowAccount('edit');
            break;

        case $(this).hasClass('detail'):
            getAndShowAccount('detail');
            break;

        case $(this).hasClass('delete'):
            $('.del-title-account').text(`(${title})`);
            $('#deleteModal').modal('show');
            break;

        default:
            break;
    }
});

function getAndShowAccount(modal) {
    if (currentEmail !== '') {
        window.accountAPI.get(currentEmail)
            .then((response) => {
                if (response.success) {
                    const account = response.account._doc;
                    if (modal === 'detail') {
                        displayAccountDetail(account);
                    } else if (modal === 'edit') {
                        displayAccountEdit(account);
                    }
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
        $('#message-modal-fail').text('No account has been selected to see detail yet.')
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
    $('#detail-birthday-account').text(formatDateTime(account.birthday));
    $('#detail-address-account').text(account.address);
    $('#detail-role-account').text(account.role);
    $('#detail-status-account').text(account.status).addClass(`badge badge-sm ${getBadgeClass(account.status)}`);
    console.log(getBadgeClass(account.lock));
    $('#detail-locked-account').text(`${account.lock ? 'locked' : 'nolock'}`).addClass(`badge badge-sm ${getBadgeClass(account.lock)}`); 
    $('#detail-created-account').text(formatDateTime(account.created));
    $('#detail-updated-account').text(formatDateTime(account.updated));

    $('#detailModal').modal('show');
}

// Utils
function getBadgeClass(status) {
    switch (status) {
        case 'actived':
            return 'bg-gradient-success';
        case 'inactived':
            return 'bg-gradient-secondary';
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
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

function formatDateTime(dateString) {
    const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', options);
}

$(document).ready(init);