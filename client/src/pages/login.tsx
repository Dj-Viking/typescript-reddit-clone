import React, { useState } from 'react';
import { Formik, Form, Field, FieldConfig, FieldProps } from 'formik';
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import Wrapper from '../components/wrapper';
// import { useMutation } from 'urql';
// import { REGISTER_MUTATION } from '../utils/mutations';
import { useRouter } from 'next/router';
import { useLoginMutation } from '../generated/graphql';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface LoginProps {}

//in next.js the name of the file in the pages folder becomes a route
const Login: React.FC<LoginProps> = ({}) => {
  const router = useRouter()

  //const [,Login] = useMutation(Login_MUTATION);
  const [, login] = useLoginMutation();

  function validatePassword(value: string) {
    let error = '';
    if (!value) error = "Password is required";
    else if (value.length <= 3) 
      error = "Password must be longer than 3 characters";
    return error;
  }
  function validateEmail(value: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let error = '';
    if (!value) error = "Username is required";
    else if (emailRegex.test(value) === false) 
      error = "Email must be a valid format, i.e. example@mail.com";
    return error;
  }

  const [mutationMessage, setMutationMessage] = useState('');

  return (
    <Wrapper maxWVariant="responsive">
      <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={ async (values, actions) => {
          
          //console.log('form values', values);
          //need to create the JSON object in the format
          //  that the graphql mutation
          // is expecting as an input type
          let objectToSubmit = {
            "options": {
              "email": values.email,
              "password": values.password
            }
          }
          login(objectToSubmit)
          .then(response => {
            actions.setSubmitting(true);
            console.log(response);
            if (response.data?.login.errors) 
            {
              actions.setErrors({
                email: `Error: ${
                  response.data?.login.errors[0].field === "Credentials" 
                  ? response.data?.login.errors[0].message 
                  : response.data?.login.errors[0].message
                }`,
                password: `Error: ${
                  response.data?.login.errors[0].field === "Credentials"
                  ? response.data?.login.errors[0].message
                  : response.data?.login.errors[0].message
                }`
              });
              setMutationMessage(`Error: ${response.data?.login.errors[0].message}`);
              setTimeout(() => {
                actions.setSubmitting(false);
              }, 1000);
            }
            else if (response.data?.login.user) 
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
                  Login
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
//need to use urql client now to call the mutations but can choose to serverside render the data or not
export default withUrqlClient(createUrqlClient)(Login) ; 