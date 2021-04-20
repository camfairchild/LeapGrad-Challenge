class UserRegistrationError extends Error {};

class UniqueUserError extends UserRegistrationError {};

module.exports = {
    UserRegistrationError,
    UniqueUserError
}