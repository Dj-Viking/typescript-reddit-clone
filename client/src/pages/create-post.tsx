import { Box, Button } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Layout from '../components/layout';
// import NextLink from 'next/link';
import { useCreatePostMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const CreatePost: React.FC<{}> = ({}) => {

  const [mutationMessage, setMutationMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [textEmpty, isTextEmpty] = useState(true);
  const [titleEmpty, isTitleEmpty] = useState(true);
  const [loading, setLoading] = useState(false);
  const [,createPost] = useCreatePostMutation();
  const router = useRouter();
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
      isTextEmpty(false);
    }
  }
  function onTitleChange(event: any) {
    setTitle(event.target.value);
    //reset the error message on a valid change in realtime and not on a re-render
    if (event.target.value.length > 0) {
      setErrorMessage('');
      isTitleEmpty(false)
    }
  }

  interface IErrorOptions { message: string, type: string }
  function showErrorMessage(options: IErrorOptions ) {
    if (options.type === "empty") {
      setErrorMessage(options.message);
      setTimeout(() => {
        setLoading(false);
        // setErrorMessage('');
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
      router.push('/');
    }, 1000);
  }

  async function submit(event: any) {
    event.preventDefault();
    setSubmitted(true);
    setLoading(true);
    //validate before querying database
    if (textEmpty === true || titleEmpty === true) {
      return showErrorMessage({
        message: "Can't submit empty fields!",
        type: "empty"
      });
    }
    //valid enough to query database
    if (textEmpty === false && titleEmpty === false) {
      try {
        
        const objectToSubmit = {
          "input": {
            "text": text,
            "title": title
          }
        };
        
        const response = await createPost(objectToSubmit);
        console.log('response', response);
        
        if (response.error?.graphQLErrors[0].message.includes("Not Authenticated")) {
          return showMutationError(`Error! Must be logged in to create a post.`);
        } else {
          showMutationSuccess(`Success!: Teleporting to home page!`);
        }
        
      } catch (error) {
        //something happened with the request, possible network error
        console.error(error);
        showErrorMessage({
          message: "Error! We're sorry there was a problem with this request.",
          type: "general"
        });
      }
    }
  }
  return (
    <>
      <Layout variant="80%">
        <form onSubmit={submit}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column", 
              maxWidth: "100%" 
            }}
          >
            <label htmlFor="title">Post Title</label>
            <input
              name="title"
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
            <label htmlFor="text">Post Text</label>
            <textarea
              name="text"
              style={{width: "100%"}}
              rows={3}
              className={
                submitted && textEmpty
                ? 'custom-textarea-with-error' 
                : 'custom-textarea'
              }
              value={text}
              onChange={onTextChange}
            ></textarea>
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
                Create Post
              </Button>
            </div>
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
      </Layout>
    </>
  );
}
export default withUrqlClient(createUrqlClient, {ssr: false})(CreatePost);