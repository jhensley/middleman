# middleman
A middleman service provider between any Passport auth strategy and Github Organizations.

## Why would I need it?
Does your company use a Github paid tier account (not Enterprise Edition)? If the answer is yes ... carry on. 
Is your Github organization large and uruly? Do you have users no longer with the company still in Github? If yes, continue.
Do you need a way to communicate effectively with everyone in your organization, but half of their public profiles are lacking? 

Get the picture? Middleman is meant to solve one very specific problem that many large organizations face. You need a simple method of stitching your accounts together with Github Organizations. Middleman provides that bridge.

## What does it do exactly?
Middleman allows you to configure any Passport auth strategy as your login point. We've defaulted to SAML b/c it's what suited the needs best, but feel free to fork the repo and change it. Once a user has authenticated via your preferred authentication strategy, the user will be asked to autorize the app to their Github account. Upon completing the OAuth flow, your users will be presented with a list of available Organizations to join, upon joining they'll be emailed an invite to accept. Once they do that ... the magic is done. Your internally authenticated users are now authorized members of your Github Organization.

## Configuration

#### Environment Variables
The following environment variables are required for middleman to run.

```
GITHUB_ADMIN_TOKEN=Admin User Token for the Organization you want to manage
GITHUB_CLIENT_ID=OAuth Application Token
GITHUB_CLIENT_SECRET=OAuth Application Secret
GITHUB_CALLBACK_URL=/auth/github/callback
```

In addition you will need to add any additional variables for your Passport Auth Strategies, an example of the values required for SAML authentication are below.

```
SAML_ENTRY_POINT=https://login.com/sso
SAML_LOGOUT_URL=https://logout.com/slo
SAML_CERT=./path/to/cert.pem
SAML_PRIVATE_CERT=./path/to/cert.key
SAML_ISSUER=issuer-string
SAML_CALLBACK_URL=/auth/saml/callback
```

