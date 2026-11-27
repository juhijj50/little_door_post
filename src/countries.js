/*  The countries the post goes to.
 *
 *  A MIRROR of INTERNATIONAL in backend/app/countries.py, which is the rule.
 *  The server enforces that list and /api/config serves it, so whatever the
 *  API answers wins here the moment it lands — this copy only stands in until
 *  it does.
 *
 *  It exists because the API sleeps on Render's free tier and takes most of a
 *  minute to wake. Without it, a reader who chose "Somewhere else" in that
 *  minute opened the country dropdown and found it empty, with no way to tell
 *  whether we post to their country or the page was broken.
 *
 *  KEEP THE TWO IN STEP. Adding a country here and not there offers somewhere
 *  the order form would then refuse; removing one there and not here is worse.
 *  The EU is absent from both — see business.international.excluded.
 */
export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
  "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belize", "Benin",
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
  "Brunei", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada",
  "Cape Verde", "Central African Republic", "Chad", "Chile", "China",
  "Colombia", "Comoros", "Costa Rica", "Cuba",
  "Democratic Republic of the Congo", "Djibouti", "Dominica",
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
  "Eritrea", "Eswatini", "Ethiopia", "Fiji", "Gabon", "Gambia", "Georgia",
  "Ghana", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hong Kong", "Iceland", "Indonesia", "Iran", "Iraq",
  "Israel", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
  "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Lebanon", "Lesotho",
  "Liberia", "Libya", "Liechtenstein", "Macau", "Madagascar", "Malawi",
  "Malaysia", "Maldives", "Mali", "Marshall Islands", "Mauritania",
  "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
  "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
  "Nepal", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Puerto Rico", "Qatar", "Republic of the Congo", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Solomon Islands",
  "Somalia", "South Africa", "South Korea", "South Sudan", "Sri Lanka",
  "Sudan", "Suriname", "Switzerland", "Syria", "Taiwan", "Tajikistan",
  "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkmenistan", "Tuvalu", "Türkiye",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

export default COUNTRIES;
