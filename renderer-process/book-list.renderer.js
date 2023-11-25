function init() {
    window.bookAPI.getAll()
        .then((response) => {
            if (response.success) {
                const books = response.books.map(book => book._doc);
                displayBooks(books);
            } else {
                $('#message-modal-fail').text(response.message)
                $('#failModal').modal('show');
            }
        })
        .catch((error) => {
            $('#message-modal-fail').text('Something went wrong. Please try again later!')
            $('#failModal').modal('show');
        });

    $('#year').datepicker({
        format: "yyyy",
        viewMode: "years",
        minViewMode: "years",
        autoclose: true,
        startDate: "1970",
        endDate: new Date().getFullYear().toString()
    }).on('changeDate', function (e) {
        var selectedYear = e.date.getFullYear();
        $(this).val(selectedYear);
        updatePreTail();
        validateInput($('#barcode'));
    });
}

function displayBooks(books) {
    const tableBody = $('tbody');

    tableBody.empty();

    books.forEach(book => {
        const row = $('<tr>');
        row.append(`<td><div class="d-flex align-items-center"><img src="../assets/uploads/book/${book.img}" alt="off_white"><h6 class="ms-3">${book.title}</h6></div></td>`);
        row.append(`<td class="text-sm"><button class="action-btn print">${book.barcode}</button></td>`);
        row.append(`<td class="text-sm">${book.price}K</td>`);
        row.append(`<td class="text-sm">${book.quantity}</td>`);
        row.append(`<td><span class="badge ${getStatusBadgeClass(book.status)} badge-sm">${book.status}</span></td>`);
        row.append(`<td class="text-sm">${formatDate(book.updated)}</td>`);
        row.append(
            `<td><button type="button" class="action-btn detail"><i class="fas fa-eye text-secondary" aria-hidden="true"></i></button>
            <button type="button" class="action-btn edit"><i class="fas fa-pen-square text-secondary" aria-hidden="true"></i></button>
            <button type="button" class="action-btn import"><i class="fas fa-cart-arrow-down text-secondary"ria-hidden="true"></i></button>
            <button type="button" class="action-btn delete"><i class="fas fa-trash text-secondary" aria-hidden="true"></i></button></td>`
        );

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
let currentBarcode = '';
$('tbody').on('click', '.print, .detail, .edit, .delete, .import', function () {
    const row = $(this).closest('tr');
    const title = row.find('td:eq(0)').text();
    const quantity = row.find('td:eq(3)').text();
    currentBarcode = row.find('td:eq(1)').text();

    switch (true) {
        case $(this).hasClass('print'):
            JsBarcode(".barcode-preview", currentBarcode, {
                format: 'CODE128',
                width: 1,
                height: 60,
            });
            $('#printModal').modal('show');
            break;

        case $(this).hasClass('edit'):
            getAndShowBook('edit');
            break;

        case $(this).hasClass('detail'):
            getAndShowBook('detail');
            break;

        case $(this).hasClass('import'):
            getAndShowBook('import');
            break;

        case $(this).hasClass('delete'):
            $('.del-title-book').text(`(${title})`);
            $('#deleteModal').modal('show');
            break;

        default:
            break;
    }
});

function getAndShowBook(modal) {
    if (currentBarcode !== '') {
        window.bookAPI.get(currentBarcode)
            .then((response) => {
                if (response.success) {
                    const book = response.book._doc;
                    if (modal === 'detail') {
                        displayBookDetail(book);
                    } else if (modal === 'edit') {
                        displayBookEdit(book);
                    } else {
                        displayBookImport(book);
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
        $('#message-modal-fail').text('No book has been selected to see detail yet.')
        $('#failModal').modal('show');
    }
}

// Delete module
$('#confirm-del-btn').on('click', onConfirmDelButtonClick);

function onConfirmDelButtonClick() {
    if (currentBarcode !== '') {
        window.bookAPI.delete(currentBarcode)
            .then((response) => {
                if (response.success) {
                    $('#modal-success-title').text('Deleted!');
                    $('#modal-success-msg').text('Your book has been deleted.');
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
        $('#message-modal-fail').text('No book has been selected to delete yet.')
        $('#failModal').modal('show');
    }
}

// Import module 
function displayBookImport(book) {
    $('#import-img-book').attr('src', `../assets/uploads/book/${book.img}`);
    $('#import-current-quantity').text(book.quantity);
    $('#import-quantity').val('');
    $('#import-quantity').removeClass('is-invalid');
    $('#importModal').modal('show');
}

function validateImport(value) {
    if (!/^\d+$/.test(value) || value === null || value <= 0) {
        $('#message-modal-fail').text('Input must be a number greater than 0.')
        $('#import-quantity').addClass('is-invalid');
        $('#failModal').modal('show');
    } else if (value > 200) {
        $('#message-modal-fail').text('Quantity is too much.')
        $('#import-quantity').addClass('is-invalid');
        $('#failModal').modal('show');
    } else {
        return true;
    }
}

$('#import-quantity').on('focus', () => {
    $('#import-quantity').removeClass('is-invalid');
})

$('#next-import-btn').on('click', () => {
    const importQuantity = getValue('#import-quantity');
    if (validateImport(importQuantity)) {
        $('.import-quantity').text(importQuantity);
        $('#confirmImportModal').modal('show');
    }
});

$('#confirm-import-btn').on('click', onConfirmImportButtonClick);

function onConfirmImportButtonClick() {
    const importQuantity = getValue('#import-quantity');
    if (validateImport(importQuantity)) {
        console.log({ barcode: currentBarcode, quantity: importQuantity });
        window.bookAPI.import({ barcode: currentBarcode, quantity: importQuantity })
            .then((response) => {
                if (response.success) {
                    $('#modal-success-title').text('Imported!');
                    $('#modal-success-msg').text('Your book has been imported.');
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
        $('#message-modal-fail').text('No book has been selected to delete yet.')
        $('#failModal').modal('show');
    }
}

// Detail module
function displayBookDetail(book) {
    $('#detail-img-book').attr('src', `../assets/uploads/book/${book.img}`);
    JsBarcode(".barcode-preview", book.barcode, {
        format: 'CODE128',
        width: 1,
        height: 60,
    });

    $('#detail-category-book').text(book.category);
    $('#detail-title-book').text(book.title);
    $('#detail-author-book').text(book.author);
    $('#detail-pblisher-book').text(book.publication.publisher);
    $('#detail-year-book').text(book.publication.year);
    $('#detail-price-book').text(`${book.price}K`);
    $('#detail-quantity-book').text(book.quantity);
    $('#detail-status-book').text(book.status);
    $('#detail-status-book').addClass(`badge ${getStatusBadgeClass(book.status)} badge-sm`);
    $('#detail-created-book').text(formatDateTime(book.created));
    $('#detail-updated-book').text(formatDateTime(book.updated));

    $('#detailModal').modal('show');
}

// Edit module
let currentImg = '';
function displayBookEdit(book) {
    $('#category option').each(function () {
        if ($(this).val() === book.category) {
            $(this).prop('selected', true);
        } else {
            $(this).prop('selected', false);
        }
    });

    $('#preview').attr('src', `../assets/uploads/book/${book.img}`);
    $('#img').val(book.img);
    currentImg = book.img;
    $('#title').val(book.title);
    $('#author').val(book.author);
    $('#publisher').val(book.publication.publisher);
    $('#year').val(book.publication.year);
    $('#barcode').val(book.barcode);
    $('#price').val(book.price);

    validateAllFields()
    $('#editModal').modal('show');
}

$('#confirm-edit-btn').on('click', onConfirmEditButtonClick);

$('#edit-img-btn').on('click', onEditImgButtonClick);

$('#next-edit-btn').on('click', onNextEditButtonClick);

$('#remove-img-btn').on('click', function () {
    $('#img').val('');
    $('#preview').attr('src', '../assets/img/default-book.png');
});

$('#category').on('change', function () {
    updatePreTail();
    validateInput($('#barcode'));
});

$('#title, #author, #publisher, #price, #barcode').on('input', function () {
    if (!$(this).is('#barcode')) {
        updateBarcode();
    }
    validateInput($('#barcode'));
    validateInput($(this));
});

async function onConfirmEditButtonClick() {
    const isValid = await validateAllFields();
    if (isValid) {
        const data = {
            category: getValue('#category'),
            title: getValue('#title'),
            author: getValue('#author'),
            publisher: getValue('#publisher'),
            year: getValue('#year'),
            barcode: currentBarcode,
            newbarcode: getValue('#barcode'),
            price: getValue('#price'),
            img: getValue('#img'),
        };
        console.log(data);

        window.bookAPI.edit(data)
            .then((response) => {
                if (response.success) {
                    $('#modal-success-title').text('Updated!');
                    $('#modal-success-msg').text('This book has been updated.');
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

function onEditImgButtonClick() {
    window.bookAPI.chooseImage()
        .then(({ filePath, base64Image }) => {
            $('#img').val(filePath);

            $('#preview').attr('src', base64Image);
        })
        .catch((error) => {
            $('#img').val('');
            $('#preview').attr('src', `../assets/img/${currentImg}`);
        });
}

async function onNextEditButtonClick() {
    const isValid = await validateAllFields();
    if (isValid) {
        $('#previewModal').modal('show');
        const barcode = $('#barcode').val();
        JsBarcode(".barcode-preview", barcode, {
            format: 'CODE128',
            width: 1,
            height: 60,
        });
    } else {
        $('#message-modal-fail').text('Please correct invalid fields')
        $('#failModal').modal('show');
    }
}

async function validateAllFields() {
    const fields = ['#title', '#author', '#publisher', '#price', '#barcode'];
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

    if (input.is('#barcode')) {
        const check = await existBarcode(value);
        if (!check || value === currentBarcode) {
            input.removeClass('is-invalid').addClass('is-valid');
            return true;
        } else {
            input.removeClass('is-valid').addClass('is-invalid');
            return false;
        }
    }
    if (value.length === 0 || (input.is('#author, #publisher') && !/^[a-zA-Z\s]+$/.test(value)) || (input.is('#price') && !/^\d+$/.test(value))) {
        input.removeClass('is-valid').addClass('is-invalid');
        return false;
    } else {
        input.removeClass('is-invalid').addClass('is-valid');
    }
    return true;
}

async function updateBarcode() {
    const category = getValue('#category').substring(0, 3).toUpperCase();
    const title = getValue('#title').substring(0, 3).toUpperCase();
    const author = getValue('#author').substring(0, 3).toUpperCase();
    const year = getValue('#year');

    const sku = `${category}-${title}${author}-${year}`;
    $('#barcode').val(padMid(sku, 4, 15, 'X'));

    const check = await existBarcode($('#barcode').val());
    return check;
}

function updatePreTail() {
    const category = getValue('#category').substring(0, 3).toUpperCase();
    const year = getValue('#year');
    const currentBarcode = $('#barcode').val();
    $('#barcode').val(`${category}${currentBarcode.slice(3, currentBarcode.length - 4)}${year}`);
}

async function existBarcode(barcode) {
    try {
        const response = await window.bookAPI.checkBarcode(barcode);
        return response.exists;
    } catch (error) {
        return false;
    }
}

// Utils
function getStatusBadgeClass(status) {
    switch (status) {
        case 'new':
            return 'badge-primary';
        case 'in stock':
            return 'badge-success';
        case 'warning':
            return 'badge-warning';
        case 'out of stock':
            return 'badge-danger';
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

function getValue(selector) {
    return $(selector).val().trim();
}

function padMid(originalStr, position, len, str) {
    if (position > originalStr.length) {
        throw new Error('Position is beyond the length of the original string.');
    }

    let insertStr = '';
    let originalLen = originalStr.length;
    while (originalLen < len) {
        insertStr += str;
        originalLen += 1;
    }

    return originalStr.slice(0, position) + insertStr + originalStr.slice(position);
}

$(document).ready(init);