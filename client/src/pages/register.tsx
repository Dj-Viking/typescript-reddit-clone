import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, FieldConfig, FieldProps } from 'formik';
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import Wrapper from '../components/wrapper';
// import { useMutation } from 'urql';
// import { REGISTER_MUTATION } from '../utils/mutations';
import { useRouter } from 'next/router';
import { useRegisterMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';

interface RegisterProps {}

//in next.js the name of the file in the pages folder becomes a route
const Register: React.FC<RegisterProps> = ({}) => {
  const router = useRouter()

  //const [,register] = useMutation(REGISTER_MUTATION);
  const [, register] = useRegisterMutation();

  useEffect(() => {
    document.title = "Register"
  }, [])

  function validatePassword(value: string) {
    let error = '';
    if (!value) error = "Password is required";
    else if (value.length <= 3) error = "Password must be longer than 3 characters";
    return error;
  }
  function validateUsername(value: string) {
    let error = '';
    if (!value) error = "Username is required";
    else if (value.length <= 3) error = "Username must be longer than 3 characters";
    return error;
  }
  function validateEmail(value: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let error = '';
    if (!value) error = "Email is required";
    else if (emailRegex.test(value) === false)
      error = "Email must be in valid format. i.e. example@mail.com"
    return error;
  }

  const [mutationMessage, setMutationMessage] = useState('');

  return (
    <Wrapper maxWVariant="responsive">
      <Formik
        initialValues={{ username: "", email: "", password: "" }}
        onSubmit={ async (values, actions) => {
          
          //console.log('form values', values);
          //need to create the JSON object in the format
          //  that the graphql mutation
          // is expecting as an input type
          let objectToSubmit = {
            "options": {
              "username": values.username,
              "email": values.email,
              "password": values.password
            }
          }
          register(objectToSubmit)
          .then(response => {
            actions.setSubmitting(true);
            console.log(response);
            if (response.data?.register.errors) 
            {
              actions.setErrors({
                username: `Error: ${
                  response.data?.register.errors[0].field === "Username" 
                  ? response.data?.register.errors[0].message 
                  : response.data?.register.errors[0].message
                }`,
                email: `Error: ${
                  response.data?.register.errors[0].field === "Email"
                  ? response.data?.register.errors[0].message
                  : response.data?.register.errors[0].message
                }`
              });
              setMutationMessage(`Error: ${response.data?.register.errors[0].message}`);
              setTimeout(() => {
                actions.setSubmitting(false);
              }, 1000);
            }
            else if (response.data?.register.user) 
            {
              //register success
              setMutationMessage(`Success! Teleporting to Home Page!`);
              setTimeout(() => {
                router.push('/');
              }, 1500);
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
                    ({ field, form }: FieldProps): FieldConfig["children"] => (
                      <FormControl isInvalid={
                        !!form.errors.username 
                        && !!form.touched.username
                      }>
                        <FormLabel htmlFor="username">Username</FormLabel>
                        <Input
                          {...field}
                          type="text" 
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
                  name="email" 
                  validate={validateEmail}
                >
                  {
                    ({ field, form }: FieldProps): FieldConfig["children"] => (
                      <FormControl isInvalid={
                        !!form.errors.email 
                        && !!form.touched.email
                      }>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <Input
                          {...field}
                          type="text" 
                          id="email" 
                          placeholder="email" 
                          autoComplete="off"
                          required
                        />
                        <FormErrorMessage>{form.errors.email}</FormErrorMessage>
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
                    ({ field, form }: FieldProps): FieldConfig["children"] => (
                      <FormControl isInvalid={
                        !!form.errors.password 
                        && !!form.touched.password
                      }>
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
                  Register
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
export default withUrqlClient(createUrqlClient)(Register);