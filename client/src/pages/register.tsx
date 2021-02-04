import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import Wrapper from '../components/wrapper';
import { useMutation } from 'urql';
import { REGISTER_MUTATION } from '../utils/mutations';

interface RegisterProps {

}

//in next.js the name of the file in the pages folder becomes a route
const Register: React.FC<RegisterProps> = ({}) => {

  const [,register] = useMutation(REGISTER_MUTATION);

  function validatePassword(value: string) {
    let error: string;
    if (!value) error = "Password is required";
    else if (value.length <= 3) error = "Password must be longer than 3 characters";
    return error;
  }
  function validateUsername(value: string) {
    let error: string;
    if (!value) error = "Username is required";
    else if (value.length <= 3) error = "Username must be longer than 3 characters";
    return error;
  }

  const [mutationMessage, setMutationMessage] = useState('');

  return (
    <Wrapper maxWVariant="responsive">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={ async (values, actions) => {
          
          //console.log('form values', values);
          //need to create the JSON object in the format
          //  that the graphql mutation
          // is expecting as an input type
          let objectToSend = {
            "options": {
              "username": values.username,
              "password": values.password
            }
          }
          register(objectToSend)
          .then(response => {
            actions.setSubmitting(true);
            console.log(response);
            if (response.data.register.errors) {
              setMutationMessage(`Error: ${response.data.register.errors[0].message}`);
              setTimeout(() => {
                actions.setSubmitting(false);
              }, 1000);
            }
            else if (response.data.register.user) {
              setMutationMessage(`Success! Teleporting to Home Page!`);
            }
          })
          .catch(err => {
            console.log(err);
          });

        }}
      >
        {
          (props) => (
            <Form>

              <Box mt={4}>
                <Field 
                  name="username" 
                  validate={validateUsername}
                >
                  {
                    ({ field, form }) => (
                      <FormControl isInvalid={form.errors.username && form.touched.username}>
                        <FormLabel htmlFor="username">Username</FormLabel>
                        <Input
                          {...field}
                          type="username" 
                          id="username" 
                          placeholder="username" 
                          autoComplete="off"
                          required
                        />
                        <FormErrorMessage>{form.errors.username}</FormErrorMessage>
                      </FormControl>
                    )
                  }
                </Field>  
              </Box>

              <Box mt={4}>
                <Field 
                  name="password" 
                  validate={validatePassword}
                >
                  {
                    ({ field, form }) => (
                      <FormControl isInvalid={form.errors.password && form.touched.password}>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <Input
                          {...field}
                          type="password" 
                          id="password" 
                          placeholder="password" 
                          autoComplete="off"
                          required
                        />
                        <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                      </FormControl>
                    )
                  }
                </Field>
              </Box>

              <Box display="flex" justifyContent="center" flexDirection="column" >
                <Button
                  w="100px"
                  mx="auto"
                  mt={4}
                  colorScheme="teal"
                  isLoading={props.isSubmitting}
                  type="submit"
                >
                  Submit
                </Button>
                {
                  mutationMessage.includes('Error:')
                  ?
                  <div style={{
                    color: 'red',
                    margin: '0 auto',
                  }}>
                    {mutationMessage}
                  </div>
                  :
                  <div style={{
                    color: 'green',
                    margin: '0 auto'
                  }}>
                    {mutationMessage}
                  </div>
                }
              </Box>

            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
}
export default Register;