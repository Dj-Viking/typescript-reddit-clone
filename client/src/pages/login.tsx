import React, { useState } from 'react';
import { Formik, Form, Field, FieldConfig, FieldProps } from 'formik';
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import Wrapper from '../components/wrapper';
// import { useMutation } from 'urql';
// import { REGISTER_MUTATION } from '../utils/mutations';
import { useRouter } from 'next/router';
import { useLoginMutation } from '../generated/graphql';

interface LoginProps {

}

//in next.js the name of the file in the pages folder becomes a route
const Login: React.FC<LoginProps> = ({}) => {
  const router = useRouter()

  //const [,Login] = useMutation(Login_MUTATION);
  const [, login] = useLoginMutation();

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
          login(objectToSend)
          .then(response => {
            actions.setSubmitting(true);
            console.log(response);
            if (response.data?.login.errors) 
            {
              actions.setErrors({
                username: `Error: ${
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
export default Login; 