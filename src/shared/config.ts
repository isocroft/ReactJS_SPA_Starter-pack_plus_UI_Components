export default {
  PROD: process.env.NODE_ENV === "production",
  ENV: process.env.NODE_ENV,
  DEV_FEATURES_LIST: [
    /* @HINT: all features shown to a user on {https://localhost:3100} LOCAL deploy (development env) except the ones with an underscore at the begining */
    "page.menuitem:home|segments=[*]",
    "page.menuitem:vehicles|role=[admin];qualifier=0.25"
  ],
  PROD_FEATURES_LIST: [
    /* @HINT: all features shown to a user on {https://myapp.com} LOCAL deploy (production env) except the ones with an underscore at the begining */
    "_page.menuitem:home"
  ]
};
