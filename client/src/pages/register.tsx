import React from 'react';
import { Formik, Form, Field } from 'formik';
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import Wrapper from '../components/wrapper';

interface RegisterProps {

}

//in next.js the name of the file in the pages folder becomes a route
const Register: React.FC<RegisterProps> = ({}) => {

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

  return (
    <Wrapper maxWVariant="responsive">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values, actions) => {
          console.log(values);
          //realistically do the ajax calls here
          // and handle what happens before and after
          // the data arrives
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2))
            actions.setSubmitting(false)
          }, 200)
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

              <Box display="flex" justifyContent="center">
                <Button
                  mt={4}
                  colorScheme="teal"
                  isLoading={props.isSubmitting}
                  type="submit"
                >
                  Submit
                </Button>
              </Box>

            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
}
export default Register;