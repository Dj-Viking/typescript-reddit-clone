import React from 'react';
import { 
    Formik, 
    Form, 
    Field
} from 'formik';
import { Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import Wrapper from '../components/wrapper';

interface registerProps {
    
}


//in next.js the name of the file in the pages folder becomes a route
const Register: React.FC<registerProps> = ({}) => {

    function validateName(value) 
    {
        let error: string;
        if (!value) error = "Name is required";
        else if (value.length <= 3) error = "Name must be longer than 3 characters";
        return error;
    }

    return (
        <Wrapper>
            <Formik
                initialValues={{ name: "" }}
                onSubmit={(values, actions) => {
                    setTimeout(() => {
                        alert(JSON.stringify(values, null, 2))
                        actions.setSubmitting(false)
                    }, 200)
                }}
            >
                {
                    (props) => (
                        <Form>
                            <Field 
                                name="name" 
                                validate={validateName}
                            >
                                {({ field, form }) => (
                                <FormControl isInvalid={form.errors.name && form.touched.name}>

                                    <FormLabel htmlFor="name">
                                        Username
                                    </FormLabel>
                                    <Input 
                                        {...field} 
                                        id="name" 
                                        placeholder="Username" 
                                    />

                                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                                </FormControl>
                                )}
                            </Field>
                            <Button
                                mt={4}
                                colorScheme="teal"
                                isLoading={props.isSubmitting}
                                type="submit"
                            >
                                Submit
                            </Button>
                        </Form>
                    )
                }
            </Formik>
        </Wrapper>
    );
}
export default Register;