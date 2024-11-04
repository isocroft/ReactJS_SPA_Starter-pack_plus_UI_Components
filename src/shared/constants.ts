export const envProduction = "production";
export const envDevelopment = "development";
export const envTest = "test";

/* #a11y roles */

export const roleHeading = "heading";
export const roleHeadingLevel1 = 1;
export const roleHeadingLevel2 = 2;
export const roleHeadingLevel3 = 3;
export const roleHeadingLevel4 = 4;
export const roleHeadingLevel5 = 5;

export const roleListBox = "listbox";
export const roleList = "list";
export const roleListItem = "listitem";

export const roleImage = "img";

export const roleButton = "button";

export const roleContentInfo = "contentinfo";

export const roleTooltip = "tooltip";

export const roleAlert = "alert";
export const roleBanner = "banner";
export const roleFeed = "feed";

/* @NOTE: Feature flag toggle items  (START) */

export const homePage = "page:home";
export const vehiclesPage = "page:vehicle";

/* @NOTE: Feature flag toggle items  (END) */

export const size = {
  mobileS: "320px",
  mobileM: "375px",
  mobileL: "425px",
  tablet: "768px",
  laptopS: "890px",
  laptop: "1025px",
  laptopM: "1212px",
  laptopXM: "1281px",
  laptopL: "1441px",
  desktop: "2561px",
  tv: "3020px"
};

export const useQueryConfig = {
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  cacheTime: 250000,
  staleTime: 150000,
  keepPreviousData: true
};

export const useQueryConfigLite = {
  refetchOnMount: false,
  cacheTime: 250000,
  staleTime: 150000
};

export const useQueryConfigLiter = {
  refetchOnMount: true,
  cacheTime: 200000,
  staleTime: 100000
};
