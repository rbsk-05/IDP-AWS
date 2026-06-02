// AWS Cognito Configuration placeholders
// These can be replaced with real outputs from Terraform
export const COGNITO_CLIENT_ID = "1jdfrnp45sfpeo4jk5j8lft3dv";
export const COGNITO_REGION = "ap-southeast-1";

// Ministry Master Override credentials requested by the user
export const ADMIN_EMAIL = "admin@gmail.com";
export const ADMIN_PASSWORD = "1234";

const isCognitoConfigured = () => {
  return (
    COGNITO_CLIENT_ID &&
    COGNITO_CLIENT_ID !== "YOUR_CLIENT_ID" &&
    COGNITO_CLIENT_ID.trim() !== ""
  );
};

const cognitoFetch = async (target, body) => {
  const res = await fetch(
    `https://cognito-idp.${COGNITO_REGION}.amazonaws.com`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": `AWSCognitoIdentityProviderService.${target}`,
      },
      body: JSON.stringify(body),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `${target} failed.`);
  }
  return data;
};

export const signUpUser = async (email, password) => {
  // Check user master override bypass
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    throw new Error("Admin user is pre-registered and cannot sign up.");
  }

  if (!isCognitoConfigured()) {
    // Graceful mock registration fallback
    console.log("[Mock Auth] Registering user in mock database:", email);
    return { mock: true, email };
  }

  return cognitoFetch("SignUp", {
    ClientId: COGNITO_CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [{ Name: "email", Value: email }],
  });
};

export const confirmSignUpUser = async (email, code) => {
  if (!isCognitoConfigured()) {
    console.log("[Mock Auth] Confirming mock registration for:", email);
    return { mock: true, email };
  }

  return cognitoFetch("ConfirmSignUp", {
    ClientId: COGNITO_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  });
};

export const signInUser = async (email, password) => {
  // Check Master Admin Override first
  if (
    email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    password === ADMIN_PASSWORD
  ) {
    return {
      email: ADMIN_EMAIL,
      role: "admin",
      name: "Ministry Admin",
      token: "mock-admin-token-12345",
    };
  }

  // Check if admin is trying to login with wrong credentials
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    throw new Error("Invalid password for Ministry Admin.");
  }

  if (!isCognitoConfigured()) {
    // Graceful mock login fallback for standard users
    console.log("[Mock Auth] Logging in normal user:", email);
    return {
      email,
      role: "user",
      name: email.split("@")[0],
      token: "mock-user-token-abcde",
    };
  }

  try {
    const authResult = await cognitoFetch("InitiateAuth", {
      ClientId: COGNITO_CLIENT_ID,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const token = authResult.AuthenticationResult.IdToken;
    // Basic decode of JWT ID token if available, or just fallback
    return {
      email,
      role: "user",
      name: email.split("@")[0],
      token: token,
    };
  } catch (err) {
    throw new Error(err.message || "Invalid credentials.");
  }
};
