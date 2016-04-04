# middleman
A middleman service provider between any Passport auth strategy and Github Organizations.

## Why would I need it?
Does your company use a Github paid tier account (not Enterprise Edition)? If the answer is yes ... carry on. 
Is your Github organization large and uruly? Do you have users no longer with the company still in Github? If yes, continue.
Do you need a way to communicate effectively with everyone in your organization, but half of their public profiles are lacking? 

Getting the picture? Middleman is meant to solve one very specific problem that many large organizations face. You need a simple method of stitching your accounts together with Github Organizations. Middleman provides that brige.

## What does it do exactly?
Middleman allows you to configure any Passport auth strategy as your login point. We've defaulted to SAML b/c it's what suited the needs best, but feel free to fork the repo and change it. Once a user has authenticated via your preferred authentication strategy, the user will be asked to autorize the app to their Github account. Upon completing the OAuth flow, your users will be presented with a list of available Organizations to join, upon joining they'll be emailed an invite to accept. Once they do that ... the magic is done. Your internally authenticated users are now authorized members of your Github Organization.


