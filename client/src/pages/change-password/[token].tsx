import { Box, Button } from '@chakra-ui/react';
import { NextPage } from 'next';
import { withUrqlClient, NextUrqlPageContext, WithUrqlProps } from 'next-urql';
import router from 'next/router';
import React, { useState, useEffect } from 'react';
import Wrapper from '../../components/wrapper';
import { useChangePasswordMutation } from '../../generated/graphql'
import { createUrqlClient } from '../../utils/createUrqlClient';



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

  async function submit(event: any) {
    setSubmitted(true);
    console.log(event.target);
    console.log('submitting');
    setLoading(true);
    if (empty === true && valid === false) {
      setErrorMessage('Password field is empty!');
      setTimeout(() => {
        setLoading(false);
        setErrorMessage('');
        return;
      }, 1000);
    } else if (valid === false) {
      setErrorMessage('That is not a valid password must be more than 3 characters');
      setTimeout(() => {
        setLoading(false);
        return;
      }, 1000);
    }
    if (empty === false && valid === true) {
      let objectToSubmit = {
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
            setMutationMessage(`Error: ${response.data?.changePassword.errors[0].message}`);
            setTimeout(() => {
              setLoading(false);
            }, 1000);
          }
          else if (response.data?.changePassword.user)
          {
            //change password success
            setMutationMessage(`Success! Teleporting to Home Page!`);
            setTimeout(() => {
              router.push('/');
            }, 1500);
          }
        }
      } catch (error) {
        console.log(error);
        setMutationMessage(`Error: There was a problem with this request. Please try again later.`);
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    }
  }

  return (
    <>
      <Wrapper maxWVariant="responsive">
          <div
            style={{
              display: "flex",
              justifyContent: "center"
            }}
          >
            <input
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
            <Button
              w="300px"
              mx="auto"
              mt={4}
              colorScheme="teal"
              isLoading={loading}
              type="button"
              onClick={submit}
            >
              Change Password
            </Button>
            {
              mutationMessage.includes('Error:')
              ?
                <div style={{
                  color: 'red',
                  margin: '0 auto',
                  textAlign: 'center'
                }}>
                  {mutationMessage}
                </div>
              :
                <div style={{
                  color: 'green',
                  margin: '0 auto',
                  textAlign: 'center'
                }}>
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