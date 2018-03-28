//defining and setting up firebase database
var db = firebase.firestore();

// App object contains variables and functions of the REGISTRATION FORM
var app = {
    // defining html elements (fields) as variables
    elements: {
        "email": $("#email"),
        "name": $("#name"),
        "address": $("#address"),
        "password": $("#password"),
    },

    // defining error message rules for input fields
    rules: [
        {
            field: "email",
            validation: "validateEmail",
            errorMessage: "Email is not valid"
        },
        {
            field: "email",
            validation: "validateRequired",
            errorMessage: "This field is mandatory"
        },
        {
            field: "name",
            validation: "validateRequired",
            errorMessage: "This field is mandatory"
        },
        {
            field: "address",
            validation: "validateRequired",
            errorMessage: "This field is mandatory"
        },
        {
            field: "password",
            validation: "validateRequired",
            errorMessage: "This field is mandatory"
        },
        {
            field: "password",
            validation: "validatePassword",
            errorMessage: "Password should contain at least one lowercase and one uppercase letter,one number and one special character, but no whitespace"
        },
        {
            field: "password",
            validation: "validateLength",
            errorMessage: "Password should be 6-15 characters long"
        },
    ],

    // Error object is created to be filled out by validation functions later. It will contain each field and error messages as name-value pairs
    errors: {},

    /**
     * Checking whether the field is empty
     */
    validateRequired: function (value) {
        return value !== "";
    },

    /**
     * Evaluation of the typed email address based on Regex pattern
     */
    validateEmail: function (email) {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
    },

    /**
     * Password evaluation based on Regex pattern
     */
    validatePassword: function (password) {
        var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).\S{6,15}$/
        return regex.test(password);
    },

    /**
     * Validating the minimum length of password
     */
    validateLength: function (password) {
        if (password.length < 6) {
            return false;
        }
        return true;
    },

    /**
     * Show/hide password
     */
    showPassword: function () {
        if (this.checked) {
            app.elements.password.attr('type', 'text');
        }
        else {
            app.elements.password.attr('type', 'password');
        }
    },

    /**
     * Returns all of the error messages of the current input field
     * if there are more errors, it returs all of them
     * @param {the current input field} field 
     */
    getError(field) {
        let errors = [];

        app.errors[field].forEach(errorMessage => {
            errors.push(errorMessage);
        });
        return errors;
    },

    /**
     * Generating errors from field rules, if there is any
     * Returning true or false if an error is found
     */
    validateField(field) {
        let isEachRuleValid = true;

        //Creating empty arrays for each field within the app.errors object. The arrays will contain the error messages of each field if there are any
        app.errors[field] = [];

        // Validating the current typed value of the field, returning true or false accordingly
        // Filling out each field's own error array with errors based on the current content of the input field
        for (let ruleIndex = 0; ruleIndex < app.rules.length; ruleIndex++) {
            const rule = app.rules[ruleIndex];
            if (rule.field !== field) continue;

            let isValid = app[rule.validation].call(null, app.elements[rule.field].val());

            if (!isValid) {
                if (app.errors[rule.field] === undefined) {
                    app.errors[rule.field] = [];
                }
                app.errors[rule.field].push(rule.errorMessage);
                isEachRuleValid = false;
            }
        }
        return isEachRuleValid;
    },

    /**
     * Displaying the error message below each input field
     * @param {*the current input field} field 
     * @param {*the error message belonging to the current input field (from rules array) } errorMessages 
     */
    showFieldErrors(field, errorMessages) {
        app.elements[field].parent().children(".error").html(errorMessages.join("<br />"));
        app.elements[field].addClass("invalid");
    },

    /**
     * Deleting the error message from below each input field
     */
    clearFieldErrors(field, errorMessages) {
        app.elements[field].parent().children(".error").html("");
        app.elements[field].removeClass("invalid");
    },

    /**
     * Returns true/ false depending on if ecah input field's value is valid.
     * This value will be used for the activation of Submit button
     */
    validate: function () {
        let isEachValid = true;

        for (let field in app.elements) {
            let isFieldValid = app.validateField(field);

            if (!isFieldValid) {
                isEachValid = false;
            }
        }
        return isEachValid;
    },

    /**
     * Clears input fields (it will be called when the submit button is clicked)
     */
    resetForm: function () {
        $("#myForm")[0].reset();
    },

    /** Contains the emelent-specific function calls:
 * Manage input field evaluation on keyup by calling further functions
 * Validate each input field 
 * Show password on checkbox state change
 * Activate Submit button based on validation
 */
    init: function () {

        for (let field in app.elements) {

            const $element = app.elements[field];

            // Evaluate field input value
            $element.on("keyup", function () {
                let isValid = app.validateField(field);
                app.clearFieldErrors(field);
                if (!isValid) {
                    let errors = app.getError(field);
                    app.showFieldErrors(field, errors);
                }
            });

            // Submit button is being activated if all fields are valid
            $element.on("keyup", function () {
                let isEachValid = app.validate();
                $("#submit").attr("disabled", !isEachValid);
            });
        }
        // Show/ hide password
        $("#passwordCheckbox").change(app.showPassword);

        $("#submit").click(app.onSubmit);
    },

    // Manage submit functions
    onSubmit: function () {
        // Authenticate to FireBase
        firebase.auth().createUserWithEmailAndPassword(app.elements['email'].val(), app.elements['password'].val())
            .then(function (user) {
                // Store to database
                // Add a new document in collection "users"
                db.collection("users").doc(user.uid).set({
                    name: app.elements['name'].val(),
                    email: app.elements['email'].val(),
                    address: app.elements['address'].val(),
                }).then(function () {
                    $('#myForm .on-submit-success').removeClass("hidden"); // Make "successful signup" message visible
                    app.resetForm(); //reset form (clear input field values)

                }).catch(function (error) {
                    console.error("Error writing document: ", error);
                });
            })
            .catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // Display submit-error message
                $('#myForm .on-submit-error span').html(error.message);
                $('#myForm .on-submit-error').removeClass("hidden"); // Make visible
            });
    }
}   ///app object

app.init();

// Login object contains variables and functions of the LOGIN FORM
var $form = $('#loginForm');
var Login = {
    // defining html elements (fields) as variables
    elements: {
        "email": $("input[type='email']", $form),
        "password": $("input[type='password']", $form),
    },

    /**
     * Clears input fields
     */
    resetForm: function () {
        $form[0].reset();
    },

    onSubmit() {
        $('.on-submit-error', $form).addClass("hidden"); //hide past error message
        $('.on-submit-success', $form).addClass("hidden"); //hide past success message
        firebase.auth().signInWithEmailAndPassword(Login.elements['email'].val(), Login.elements['password'].val())
            .then(function (user) {
                $('.on-submit-success', $form).removeClass("hidden"); // Make success message visible
                Login.resetForm(); //reset form
            }).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                $('.on-submit-error span', $form).html(error.message);
                $('.on-submit-error', $form).removeClass("hidden"); // Make error message visible
            });
    },

    init: function () {
        $("button", $form).click(this.onSubmit);
    }
};
Login.init();

// Manage user authentication
var UserAuth = {
    init: function () {
        // Hide past error messages
        $('.on-submit-error', $form).addClass("hidden");
        // Check authentication of user 
        firebase.auth().onAuthStateChanged(function (user) {
            // User is signed in.
            if (user) {
                // Get info from Firebase database, display the name of the user
                db.collection("users").doc(user.uid).onSnapshot(function (doc) {
                    if (doc.exists) {
                        let userDoc = doc.data();
                        $('.auth-user').removeClass('hidden'); //Make welcome message visible
                        $('.auth-user span').html(userDoc.name);
                    } else {
                    }
                });
            } else {
                // User is signed out.
                $('.auth-user').addClass('hidden');
                $('.on-submit-error', $form).addClass("hidden");
                $('.on-submit-success', $("#myForm")).addClass("hidden");
            }
        });
    }
}

// Handle logout
$('.logout').click(function () {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
        $('.on-submit-success', $form).addClass("hidden"); // Hide "successful signin" message
    }).catch(function (error) {
        // An error happened.
    });
});

UserAuth.init();