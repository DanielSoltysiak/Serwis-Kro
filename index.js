function removeFieldError(field) {
    const errorText = field.nextElementSibling;
    if (errorText !== null) {
        if (errorText.classList.contains("form-error-text")) {
            errorText.remove();
        }
    }
};

function createFieldError(field, text) {
    removeFieldError(field); //przed stworzeniem usuwam by zawsze był najnowszy komunikat

    const div = document.createElement("div");
    div.classList.add("form-error-text");
    div.innerText = text;
    if (field.nextElementSibling === null) {
        field.parentElement.appendChild(div);
    } else {
        if (!field.nextElementSibling.classList.contains("form-error-text")) {
            field.parentElement.insertBefore(div, field.nextElementSibling);
        }
    }
};

function toggleErrorField(field, show) {
    const errorText = field.nextElementSibling;
    if (errorText !== null) {
        if (errorText.classList.contains("form-error-text")) {
            errorText.style.display = show ? "block" : "none";
            errorText.setAttribute('aria-hidden', show);
        }
    }
};

function markFieldAsError(field, show) {
    if (show) {
        field.classList.add("field-error");
    } else {
        field.classList.remove("field-error");
        toggleErrorField(field, false);
    }
};

const form = document.querySelector("form");
const inputs = form.querySelectorAll("[required]")

form.setAttribute("novalidate", true);

for (const el of inputs) {
    el.addEventListener("input", e => markFieldAsError(e.target, !e.target.checkValidity()));
}

form.addEventListener("submit", e => {
    e.preventDefault();

    let formHasErrors = false;

    //-------------------------
    //2 etap - sprawdzamy poszczególne pola gdy ktoś chce wysłać formularz
    //-------------------------
    for (const el of inputs) {
        removeFieldError(el);
        el.classList.remove("field-error");

        if (!el.checkValidity()) {
            createFieldError(el, el.dataset.textError);
            el.classList.add("field-error");
            formHasErrors = true;
        }
    }

    if (!formHasErrors) { //jeżeli nie ma błędów wysyłamy formularz
        const submit = form.querySelector("[type=submit]");
        submit.disabled = true;
        submit.classList.add("loading");

        //generuję dane do wysyłki
        const formData = new FormData(form);
        const url = form.getAttribute("action"); //pobieramy adres wysyłki z action formularza
        const method = form.getAttribute("method"); //tak samo metodę

        fetch(url, {
            method: method,
            body: formData
        })
        .then(res => res.json())
        .then(res => {
            if (res.errors) { //błędne pola
                const selectors = res.errors.map(el => `[name="${el}"]`);
                const fieldsWithErrors = form.querySelectorAll(selectors.join(","));
                for (const el of fieldsWithErrors) {
                    markFieldAsError(el, true);
                    toggleErrorField(el, true);
                }
            } else { //pola są ok - sprawdzamy status wysyłki
                if (res.status === "ok") {
                    const div = document.createElement("div");
                    div.classList.add("form-send-success");
                    div.innerText = "Wysłanie wiadomości się nie powiodło";

                    form.parentElement.insertBefore(div, form);
                    div.innerHTML = `
                        <strong>Wiadomość została wysłana</strong>
                        <span>Dziękujemy za kontakt. Postaramy się odpowiedzieć jak najszybciej</span>
                    `;
                    form.remove();
                }
                if (res.status === "error") {
                    //jeżeli istnieje komunikat o błędzie wysyłki
                    //np. generowany przy poprzednim wysyłaniu formularza
                    //usuwamy go, by nie duplikować tych komunikatów
                    const statusError = document.querySelector(".form-send-error");
                    if (statusError) {
                        statusError.remove();
                    }

                    const div = document.createElement("div");
                    div.classList.add("form-send-error");
                    div.innerText = "Wysłanie wiadomości się nie powiodło";
                    submit.parentElement.appendChild(div);
                }
            }
        }).finally(() => {
            submit.disabled = false;
            submit.classList.remove("loading");
        });
    }
});