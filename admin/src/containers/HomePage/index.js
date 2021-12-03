/*
 *
 * HomePage
 *
 */
/* eslint-disable */
import React, { memo, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { get, upperFirst } from "lodash";
import { auth, LoadingIndicatorPage } from "strapi-helper-plugin";
import PageTitle from "../../components/PageTitle";
import { useModels } from "../../hooks";

import { ALink, Block, Container, P, Wave, Separator } from "./components";

const HomePage = ({ history: { push } }) => {
  // Temporary until we develop the menu API
  const {
    collectionTypes,
    singleTypes,
    isLoading: isLoadingForModels,
  } = useModels();

  const hasAlreadyCreatedContentTypes = useMemo(() => {
    const filterContentTypes = (contentTypes) =>
      contentTypes.filter((c) => c.isDisplayed);

    return (
      filterContentTypes(collectionTypes).length > 1 ||
      filterContentTypes(singleTypes).length > 0
    );
  }, [collectionTypes, singleTypes]);

  if (isLoadingForModels) {
    return <LoadingIndicatorPage />;
  }

  const headerId = hasAlreadyCreatedContentTypes
    ? "HomePage.greetings"
    : "app.components.HomePage.welcome";
  const username = get(auth.getUserInfo(), "firstname", "");

  return (
    <>
      <FormattedMessage id="HomePage.helmet.title">
        {(title) => <PageTitle title="SBH - Content Manager" />}
      </FormattedMessage>
      <Container className="container-fluid">
        <div className="row">
          <div className="col-lg-8 col-md-12">
            <Block>
              <Wave />
              <FormattedMessage
                id={headerId}
                values={{
                  name: upperFirst(username),
                }}
              >
                {(msg) => <h2 id="mainHeader">{msg}</h2>}
              </FormattedMessage>
              {hasAlreadyCreatedContentTypes ? (
                <>
                  <h3 style={{ marginTop: 15, marginBottom: 10 }}>
                    Welcome to the Simpsonbay Heritage Content Management
                    System.
                  </h3>
                  <P>
                    On this Admin page you will be able to manage all the
                    content and access privileges to the Simpsonbay Heritage
                    website. <br />
                    <br /> For example, in the menu to the left, under{" "}
                    <code>Introduction</code> you're able to update the
                    introduction text and video that users will see when they
                    sign-in to the website.
                  </P>
                  <P>
                    Here are a few other great things you can do as an Admin!
                  </P>
                  <br />
                  <h2>Invite users</h2>
                  <P>
                    In the menu to the left, under <code>Invites</code> you can
                    create unique invite links to share with friends and family.
                    With an invite link users of the website will be able to
                    create an account and sign-in to view the private content.{" "}
                    <br /> <br />
                    <b>
                      Keep in mind that when an invite link is created, an
                      invite email is automatically sent to the user's email
                      address.
                    </b>
                  </P>
                  <br />
                  <h2>Group invites</h2>
                  <P>
                    You can also create <code>Group invites</code>. A group
                    invite link allows you to easily invite multiple users to
                    join the website. You simply create a new group invite and
                    then set the <code>maximum</code> amount of users you'd like
                    to invite with this link.
                  </P>
                  <P>
                    <b>Optionally</b>, you can also set an{" "}
                    <code>expiration</code> date, after which the invite link
                    will no longer be valid. Users will <b>not</b> be able to
                    use the invite link to register for an account if the link
                    has expired or if the maximum allotted users have already
                    registered.
                  </P>
                </>
              ) : (
                <FormattedMessage id="HomePage.welcome.congrats">
                  {(congrats) => {
                    return (
                      <FormattedMessage id="HomePage.welcome.congrats.content">
                        {(content) => {
                          return (
                            <FormattedMessage id="HomePage.welcome.congrats.content.bold">
                              {(boldContent) => {
                                return (
                                  <P>
                                    <b>{congrats}</b>&nbsp;
                                    {content}&nbsp;
                                    <b>{boldContent}</b>
                                  </P>
                                );
                              }}
                            </FormattedMessage>
                          );
                        }}
                      </FormattedMessage>
                    );
                  }}
                </FormattedMessage>
              )}
            </Block>
          </div>

          <div className="col-md-12 col-lg-4">
            <Block style={{ paddingRight: 30, paddingBottom: 0 }}>
              <FormattedMessage id="HomePage.community">
                {(msg) => <h2>Visit the website</h2>}
              </FormattedMessage>
              <FormattedMessage id="app.components.HomePage.community.content">
                {(content) => (
                  <P style={{ marginTop: 7, marginBottom: 0 }}>
                    Click the link below to visit the Simpsonbay Heritage
                    website.
                  </P>
                )}
              </FormattedMessage>
              <FormattedMessage id="HomePage.roadmap">
                {(msg) => (
                  <ALink
                    rel="noopener noreferrer"
                    href="https://www.simpsonbay-heritage.com"
                    target="_blank"
                  >
                    Simpsonbay Heritage
                  </ALink>
                )}
              </FormattedMessage>

              <Separator style={{ marginTop: 18 }} />
            </Block>
          </div>
        </div>
      </Container>
    </>
  );
};

export default memo(HomePage);
