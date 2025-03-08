import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node"; 
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Box,
  Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

// Add this interface at the top level, outside any functions
interface NavigationOption {
  text: string;
  targetUrl: string;
  nextVideoUrl?: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return json({
    configuration: {
      merchantName: "",
      storeName: "",
      position: "bottom-right",
      welcomeVideoUrl: "",
      navigationOptions: [] as NavigationOption[]  // Explicitly typed empty array
    }
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  // Process form submission and save configuration
  const formData = await request.formData();
  const configData = JSON.parse(formData.get("config") as string);
  
  // In a real implementation, you would save this to the database or metafields
  console.log("Saving configuration:", configData);
  
  return json({ status: "success" });
};

export default function Index() {
  const { configuration } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  
  // Replace your existing useState calls with these properly typed ones
  const [config, setConfig] = useState<{
    merchantName: string;
    storeName: string;
    position: string;
    welcomeVideoUrl: string;
    navigationOptions: NavigationOption[];
  }>(configuration);
  
  const [newOption, setNewOption] = useState<NavigationOption>({
    text: "",
    targetUrl: "",
    nextVideoUrl: undefined // Optional, can be undefined
  });
  
  const positionOptions = [
    { label: "Bottom Right", value: "bottom-right" },
    { label: "Bottom Left", value: "bottom-left" },
    { label: "Top Right", value: "top-right" },
    { label: "Top Left", value: "top-left" }
  ];
  
  // The rest of your component remains the same
  const handleSave = () => {
    const formData = new FormData();
    formData.append("config", JSON.stringify(config));
    submit(formData, { method: "post" });
  };
  
  const handleAddOption = () => {
    if (newOption.text && newOption.targetUrl) {
      setConfig({
        ...config,
        navigationOptions: [
          ...config.navigationOptions,
          { ...newOption }
        ]
      });
      setNewOption({ text: "", targetUrl: "", nextVideoUrl: undefined });
    }
  };
  
  const handleRemoveOption = (index: number) => {
    const newOptions = [...config.navigationOptions];
    newOptions.splice(index, 1);
    setConfig({
      ...config,
      navigationOptions: newOptions
    });
  };
  
  return (
    <Page>
      <TitleBar title="Aloha Video Widget Setup" />
      <BlockStack gap="500">
        <Banner
          title="Welcome to Aloha!"
          tone="info"
        >
          <p>Configure your interactive video widget to guide customers through your store.</p>
        </Banner>
        
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Basic Configuration</Text>
                <FormLayout>
                  <TextField
                    label="Your Name"
                    value={config.merchantName}
                    onChange={(value) => setConfig({ ...config, merchantName: value })}
                    helpText="This will be displayed to your customers"
                    autoComplete="off"
                  />
                  
                  <TextField
                    label="Store Name"
                    value={config.storeName}
                    onChange={(value) => setConfig({ ...config, storeName: value })}
                    autoComplete="off"
                  />
                  
                  <Select
                    label="Widget Position"
                    options={positionOptions}
                    value={config.position}
                    onChange={(value) => setConfig({ ...config, position: value })}
                  />
                </FormLayout>
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Welcome Video</Text>
                <Button>Upload Video</Button>
                {config.welcomeVideoUrl && (
                  <Box paddingBlock="400">
                    <video 
                      src={config.welcomeVideoUrl} 
                      controls 
                      style={{ maxWidth: "100%", maxHeight: "200px" }}
                    />
                  </Box>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Navigation Options</Text>
                <Text variant="bodyMd" as="p">
                  Add buttons that will appear after your welcome message to help customers navigate to specific collections or products.
                </Text>
                
                <FormLayout>
                  <TextField
                    label="Button Text"
                    value={newOption.text}
                    onChange={(value) => setNewOption({ ...newOption, text: value })}
                    placeholder="e.g., Shop Women's Collection"
                    autoComplete="off"
                  />
                  
                  <TextField
                    label="Target URL"
                    value={newOption.targetUrl}
                    onChange={(value) => setNewOption({ ...newOption, targetUrl: value })}
                    placeholder="/collections/womens"
                    helpText="Where customers will be directed when clicking this option"
                    autoComplete="off"
                  />
                  
                  <Button onClick={handleAddOption}>Add Option</Button>
                </FormLayout>
                
                {config.navigationOptions.length > 0 && (
                  <BlockStack gap="300">
                    <Text variant="headingSm" as="h4">Added Options</Text>
                    {config.navigationOptions.map((option, index) => (
                      <InlineStack blockAlign="center" gap="200" key={index}>
                        <div style={{ flexGrow: 1 }}>
                          <strong>{option.text}</strong>: {option.targetUrl}
                        </div>
                        <Button 
                          tone="critical" 
                          variant="plain" 
                          onClick={() => handleRemoveOption(index)}
                        >
                          Remove
                        </Button>
                      </InlineStack>
                    ))}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section>
            <Card>
              <BlockStack gap="200">
                <Button onClick={handleSave}>Save Configuration</Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}