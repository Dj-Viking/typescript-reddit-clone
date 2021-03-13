import { Box, Button, Link } from '@chakra-ui/react';
import { NextPage } from 'next';
import { withUrqlClient, NextUrqlPageContext, WithUrqlProps } from 'next-urql';
import router from 'next/router';
import React, { useState, useEffect } from 'react';
import Wrapper from '../../components/wrapper';
import { useChangePasswordMutation } from '../../generated/graphql'
import { createUrqlClient } from '../../utils/createUrqlClient';
import NextLink from 'next/link';

const ChangePassword: NextPage<WithUrqlProps> = (props) => {

  const [mutationMessage, setMutationMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [valid, setValid] = useState(false);
  const [empty, setEmpty] = useState(true);
  const [loading, setLoading] = useState(false);
  const [, changePassword ] = useChangePasswordMutation();

  //have to use this to trigger a re-render and recreate the validate
  // function to actually use the current copy of the previous state
  //  with a new value and not the previous state when observing the values
  // of the stateful values being set by useState 
  useEffect(() => {
    document.title = "Change Password"
    function validatePassword(password: string) {
      if (password.length <= 0) {
        setValid(false);
        setEmpty(true);
      }
      if (password.length > 0) {
        setErrorMessage('');
        setEmpty(false);
      }
      if (password.length > 3) {
        setErrorMessage('');
        setValid(true);
      } else if (password.length <= 3) {
        setValid(false);
      }
    }
    setPassword(password);
    validatePassword(password);
  }, [password, setPassword, setValid, setEmpty, valid, empty]);

  //need this in order to actually change the value of the input
  // to render onto the DOM
  function onPasswordChange(event: any) {
    setPassword(event.target.value);
  }

  function showErrorMessage(message: string) {
    setErrorMessage(message);
    setTimeout(() => {
      setLoading(false);
      setErrorMessage('');
    }, 1000);
  }

  function showMutationError(message: string) {
    setMutationMessage(message);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }
  function showMutationSuccess(message: string) {
    setMutationMessage(message);
    setTimeout(() => {
      router.push('/');
    }, 1500);
  }

  async function submit(event: any) {
    event.preventDefault();
    setSubmitted(true);
    setLoading(true);
    if (empty === true && valid === false) {
      showErrorMessage("Password field is empty!");
    } else if (valid === false) {
      showErrorMessage("That is not a valid password. Must be more than 3 characters");
    }
    if (empty === false && valid === true) {
      const objectToSubmit = {
        "token": props.token,
        "newPassword": password
      }
      try {
        const response = await changePassword(objectToSubmit);
        if (response) {
          setLoading(true);
          console.log(response);
          if (response.data?.changePassword.errors)
          {
            if (response.data?.changePassword.errors[0].field === "token") {
              showMutationError(`Token Error: ${response.data?.changePassword.errors[0].message}`);
              return;
            }
            if (response.data?.changePassword.errors[0].field === "newPassword") {
              showMutationError(`Error! ${response.data?.changePassword.errors[0].message}`);
              return;
            }
          }
          else if (response.data?.changePassword.user)
          {
            //change password success
            showMutationSuccess(`Success! Teleporting to Home Page!`);
          }
        }
      } catch (error) {
        console.log(error);
        showMutationError("Error! There was a problem with this request. Please try again later.");
      }
    }
  }

  return (
    <>
      <Wrapper maxWVariant="80%">
        <form onSubmit={submit}>
          <div
            style={{
              display: "flex",
              justifyContent: "center"
            }}
          >
            <input
              style={{width: "100%"}}
              className={!valid && submitted ? 'forgot-input-with-error' : 'forgot-input'}
              type="password"
              value={password}
              onChange={onPasswordChange}
            />
          </div>
          <Box 
            display="flex" 
            justifyContent="center" 
            flexDirection="column" 
            maxWidth="100%" 
          >
            <div style={{textAlign: "center"}}>
              <Button
                w="100%"
                mt={4}
                colorScheme="teal"
                isLoading={loading}
                type="submit"
              >
                Reset Password
              </Button>
            </div>
            {/* error message display */}
            {
              mutationMessage.includes('Token')
              ?
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column"
                  }}
                >
                  <NextLink href="/forgot-password">
                    <div>
                      <p style={{margin: '0 auto', color: 'red', textAlign: "center"}}>
                        {mutationMessage}
                      </p>
                      <Link>
                      <p style={{margin: "0 auto", color: "teal", textAlign: "center"}}>
                        Forgot Password?
                      </p>
                      </Link>
                    </div>
                  </NextLink>
                </div>
              : 
                null
            }
            {
              mutationMessage.includes('Error!')
              &&
                <div style={{color: 'red', margin: '0 auto', textAlign: 'center'}}>
                  {mutationMessage}
                </div>
            }
            {
              mutationMessage.includes("Success!")
              &&
                <div style={{color: 'green', margin: '0 auto', textAlign: 'center'}}>
                  {mutationMessage}
                </div>
            }
            {
              errorMessage.length > 0
              ?
                <div
                  style={{
                    width: "100%",
                    color: "red",
                    margin: "0 auto",
                    textAlign: "center"
                  }}
                >
                  {errorMessage}
                </div>
              : 
                null
            }
          </Box>
        </form>
      </Wrapper>
    </>
  );
}

ChangePassword.getInitialProps = (ctx: NextUrqlPageContext): WithUrqlProps => {
  // Do something with the urql Client instance!
  const token = ctx.query
  return token;
}

export default withUrqlClient(createUrqlClient, {ssr: false})(ChangePassword);