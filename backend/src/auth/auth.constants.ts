export const AUTH_MESSAGES = {
  // Komunikaty logiczne (zwracane przez API/serwisy)
  EMAIL_ALREADY_EXISTS: 'Użytkownik o podanym adresie e-mail już istnieje.',
  REGISTER_SUCCESS:
    'Rejestracja pomyślna. Sprawdź swoją skrzynkę e-mail w celu weryfikacji konta.',
  INVALID_OR_EXPIRED_TOKEN: 'Nieprawidłowy lub wygasły token weryfikacyjny.',
  TOKEN_EXPIRED:
    'Token weryfikacyjny wygasł. Zarejestruj się ponownie lub poproś o nowy link.',
  VERIFICATION_SUCCESS:
    'Konto zostało pomyślnie zweryfikowane. Możesz się zalogować.',
  INVALID_CREDENTIALS: 'Nieprawidłowy e-mail lub hasło.',
  EMAIL_NOT_VERIFIED:
    'Konto nie zostało jeszcze zweryfikowane. Potwierdź swój e-mail.',
  USER_NOT_FOUND: 'Użytkownik nie istnieje.',

  // Opisy do dokumentacji Swaggera (OpenAPI)
  REGISTER_SUMMARY: 'Rejestracja nowego użytkownika',
  REGISTER_CREATED_DESC:
    'Użytkownik został pomyślnie zarejestrowany. Link weryfikacyjny został wysłany na e-mail.',
  REGISTER_BAD_REQUEST_DESC:
    'Błędne dane wejściowe lub e-mail jest już zajęty.',

  VERIFY_SUMMARY: 'Weryfikacja adresu e-mail za pomocą tokenu',
  VERIFY_TOKEN_PARAM_DESC: 'Token weryfikacyjny wysłany w wiadomości e-mail',
  VERIFY_OK_DESC: 'Konto zostało pomyślnie zweryfikowane.',
  VERIFY_BAD_REQUEST_DESC: 'Niepoprawny token lub token wygasł.',

  LOGIN_SUMMARY: 'Logowanie użytkownika',
  LOGIN_OK_DESC:
    'Pomyślne logowanie (ustawia ciasteczko sesyjne access_token).',
  LOGIN_UNAUTHORIZED_DESC:
    'Nieprawidłowe dane logowania lub konto nie zostało zweryfikowane.',

  LOGOUT_SUMMARY: 'Wylogowanie użytkownika',
  LOGOUT_OK_DESC: 'Pomyślne wylogowanie (czyści ciasteczko sesyjne).',

  GET_ME_SUMMARY: 'Pobranie danych zalogowanego użytkownika',
  GET_ME_OK_DESC: 'Zwraca dane profilowe użytkownika.',
  GET_ME_UNAUTHORIZED_DESC: 'Brak aktywnej sesji (brak lub niepoprawny token).',
};
