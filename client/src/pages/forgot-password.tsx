import  Wrapper  from '../components/wrapper';
import router from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import React, { useEffect, useState } from 'react';
import { Box, Button, Link } from '@chakra-ui/react';
import NextLink from 'next/link';

const ForgotPassword: React.FC<{}> = ({}) => {

  const [mutationMessage, setMutationMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [valid, setValid] = useState(false);
  const [empty, setEmpty] = useState(true);
  const [loading, setLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  //have to use this to trigger a re-render and recreate the validate
  // function to actually use the current copy of the previous state
  //  with a new value and not the previous state when observing the values
  // of the stateful values being set by useState 
  useEffect(() => {
    document.title = "Forgot Password"
    function validateEmail(email: string) {
      console.log(email);
      if (email.length <= 0) 
        setEmpty(true);
      if (email.length > 0) 
        setEmpty(false);
      if (emailRegex.test(email) === false) 
        setValid(false);
      else if(emailRegex.test(email))   
        setValid(true);
    }
    setEmail(email);
    validateEmail(email);
  }, [email, setEmail, setValid, setEmpty, valid, empty]);

  //need this in order to actually change the value of the input
  // to render onto the DOM
  function onEmailChange(event: any) {
    setEmail(event.target.value);
    //reset the error message on a valid change in realtime and not on a re-render
    if (emailRegex.test(event.target.value)) {
      setErrorMessage('');
    }
  }

  interface IErrorOptions {
    message: string,
    type: string
  }
  function showErrorMessage(options: IErrorOptions ) {
    if (options.type === "empty") {
      setErrorMessage(options.message);
      setTimeout(() => {
        setLoading(false);
        setErrorMessage('');
      }, 1000);
    }
    else if (options.type === "email") {
      setErrorMessage(options.message);
      setTimeout(() => {
        setLoading(false);
        //keep error message visible to read 
      }, 1000);
    }
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

  function submit() {
    setSubmitted(true);
    setLoading(true);
    if (empty === true && valid === false) {
      showErrorMessage({
        message: "Email field is empty!",
        type: "empty"
      });
    } else if (valid === false) {
      showErrorMessage({
        message: "That is not a valid email. An example would be email@example.com",
        type: "email"
      });
    }
  }

  return (
    <>
      <Wrapper maxWVariant="80%">
        <div
          style={{
            display: "flex",
            justifyContent: "center"
          }}
        >
          <input
            style={{width: "100%"}}
            className={!valid && submitted ? 'forgot-input-with-error' : 'forgot-input'}
            type="text"
            value={email}
            onChange={onEmailChange}
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
              type="button"
              onClick={submit}
            >
              Send me an Email
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
      </Wrapper>
    </>
  );
}

export default withUrqlClient(createUrqlClient, {ssr: false})(ForgotPassword);