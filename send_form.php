<?php

$mailToSend = "andrzejmiotke123@gmail.com";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $fname = $_POST["fname"];
    $lname = $_POST["lname"];
    $phone = $_POST["phone"];
    $email = $_POST["email"];
    $message = $_POST["message"];

    $errors = [];
	$return = [];

    if (empty($fname)) { //jeżeli pusta wartość
        array_push($errors, "fname");
    }
    if (empty($lname)) {
        array_push($errors, "lname");
    }
    if (empty($phone)) {
        array_push($errors, "phone");
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { //sprawdzamy czy email ma zły wzór
        array_push($errors, "email");
    }
    if (empty($message)) {
        array_push($errors, "message");
    }

    if (count($errors) > 0) {
        $return["errors"] = $errors;
    } else {
        //każde wysłanie wiadomości musi być poprzedzone ustawieniem nagłówków
        $headers  = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8". "\r\n";
        $message  = "
            <html>
                <head>
                    <meta charset=\"utf-8\">
                </head>
                <body>
                    <div> Imię: $fname</div>
                    <div> Nazwisko: $lname</div>
                    <div> Telefon: $phone</div>
                    <div> Email: <a href=\"mailto:$email\">$email</a> </div>
                    <div> Wiadomość: </div>
                    <div> $message </div>
                </body>
            </html>";

        if (mail($mailToSend, "PHU Jędrek - formularz kontaktowy" . date("d-m-Y"), $message, $headers)) {
            $return["status"] = "ok";
        } else {
            $return["status"] = "error";
        }
    }

    header("Content-Type: application/json");
    echo json_encode($return);
}
?>
