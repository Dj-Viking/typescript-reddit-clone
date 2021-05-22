import { Box, Button, Link } from '@chakra-ui/react';
import router from 'next/router';
import React, { useEffect, useState } from 'react';
import Wrapper from '../components/wrapper';
import NextLink from 'next/link';

const CreatePost: React.FC<{}> = ({}) => {

  const [mutationMessage, setMutationMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [textEmpty, isTextEmpty] = useState(true);
  const [titleEmpty, isTitleEmpty] = useState(true);
  const [loading, setLoading] = useState(false);

  //have to use this to trigger a re-render and recreate the validate
  // function to actually use the current copy of the previous state
  //  with a new value and not the previous state when observing the values
  // of the stateful values being set by useState 
  useEffect(() => {
    document.title = "Create Post"
    function validateText(text: string) {
      if (text.length <= 0) 
        isTextEmpty(true);
      if (text.length > 0) 
        isTextEmpty(false);
    }
    function validateTitle(title: string) {
      if (title.length <= 0)
        isTitleEmpty(true);
      if (title.length > 0) 
        isTitleEmpty(false);
    }
    setText(text);
    validateText(text);
    setTitle(title);
    validateTitle(title);
  }, [text, setText, isTextEmpty, isTitleEmpty, textEmpty, titleEmpty]);

  //need this in order to actually change the value of the input
  // to render onto the DOM
  function onTextChange(event: any) {
    setText(event.target.value);
    //reset the error message on a valid change in realtime and not on a re-render
    if (event.target.value.length > 0) {
      setErrorMessage('');
    }
  }
  function onTitleChange(event: any) {
    setText(event.target.value);
    //reset the error message on a valid change in realtime and not on a re-render
    if (event.target.value.length > 0) {
      setErrorMessage('');
    }
  }

  interface IErrorOptions { message: string, type: string }
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
    else if (options.type === "general") {
      setErrorMessage(options.message);
      setTimeout(() => {
        setLoading(false);
        setErrorMessage('');
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
      router.push('/login');
    }, 3000);
  }

  async function submit(event: any) {
    event.preventDefault();
    setSubmitted(true);
    setLoading(true);
    //validate before querying database
    if (textEmpty === true || titleEmpty === true) {
      return showErrorMessage({
        message: "post text and post title is empty!",
        type: "empty"
      });
    }
    //valid enough to query database
    if (textEmpty === false && titleEmpty === false) {
      try {
        const objectToSubmit = {
          "text": text,
          "title": title
        };
        const response = await forgotPassword(objectToSubmit);
        if (response) {
          console.log(response);
          if (response.data?.forgotPassword.errors) 
          {
            if (response.data?.forgotPassword.errors[0].field === "Credentials") {
              showMutationError("Error! There was a problem with this request. Please try again later");
              setText('');
              return;
            }
          } 
          else if (response.data?.forgotPassword.completed) 
          {
            showMutationSuccess('Success! A link to reset your password was sent to your email.');
            setText('');
          }
        }
      } catch (error) {
        //something happened with the request, possible network error
        console.error(error);
        showErrorMessage({
          message: "Error! There was a problem with this request. Please try again later",
          type: "general"
        });
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
            <label htmlFor="text">Post Text</label>
            <textarea
              name="text"
              style={{width: "100%"}}
              className={
                  submitted && textEmpty
                  ? 'custom-input-with-error' 
                  : 'custom-input'
              }
              value={text}
              onChange={onTextChange}
            ></textarea>
            <label htmlFor="title">Post Title</label>
            <input
              style={{width: "100%"}}
              className={
                  submitted && titleEmpty
                  ? 'custom-input-with-error' 
                  : 'custom-input'
              }
              type="text"
              value={title}
              onChange={onTitleChange}
            />
          </div>
          <Box 
            display="flex" 
            justifyContent="center" 
            flexDirection="column" 
            maxWidth="100%" 
          >
            {/* error message display */}
            {
              mutationMessage.includes('Error!')
              ?
                <div style={{color: 'red', margin: '0 auto', textAlign: 'center'}}>
                  {mutationMessage}
                </div>
              : 
                null
            }
            {
              mutationMessage.includes("Success!")
              ?
                <div style={{color: 'green', margin: '0 auto', textAlign: 'center'}}>
                  {mutationMessage}
                </div>
              : 
                null
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
export default CreatePost;