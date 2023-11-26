function init() {
    updateBarcode();
    validateInput($('#barcode'));

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

$('#next-btn').on('click', onNextButtonClick);

$('#confirm-btn').on('click', onConfirmButtonClick);

$('#edit-img-btn').on('click', onEditImgButtonClick);

$('#remove-img-btn').on('click', function () {
    $('#img').val('');
    $('#preview').attr('src', '../assets/img/default-book.png');
});

async function onNextButtonClick() {
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

async function onConfirmButtonClick() {
    const isValid = await validateAllFields();
    if (isValid) {
        const data = {
            category: getValue('#category'),
            title: getValue('#title'),
            author: getValue('#author'),
            publisher: getValue('#publisher'),
            year: getValue('#year'),
            barcode: getValue('#barcode'),
            price: getValue('#price'),
            img: getValue('#img'),
        };

        window.bookAPI.add(data)
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

function onEditImgButtonClick() {
    window.bookAPI.chooseImage()
        .then(({ filePath, base64Image }) => {
            $('#img').val(filePath);

            $('#preview').attr('src', base64Image);
        })
        .catch((error) => {
            $('#img').val('');
            $('#preview').attr('src', '../assets/img/default-book.png');
        });
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
        if (check) {
            input.removeClass('is-valid').addClass('is-invalid');
        } else {
            input.removeClass('is-invalid').addClass('is-valid');
        }
        return !check;
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
        console.error('Error calling check barcode API:', error);
        return false;
    }
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