import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export const SwaggerPanel = () => (
  <SwaggerUI
    url="/openapi.yaml"
    docExpansion="none"
    persistAuthorization={true}
  />
);
