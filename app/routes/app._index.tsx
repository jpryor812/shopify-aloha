import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node"; 
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Select,
  Button,
  Text,
  TextField,
  BlockStack,
  Banner,
  Box,
  Checkbox,
  InlineStack,
  RadioButton,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { ChatPreview } from "../components/chatPreview";

type ChatPosition = 'center' | 'bottom-right' | 'bottom-left';
type ChatMode = 'popup' | 'embedded';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return json({
    configuration: {
      apiKey: "",
      position: "bottom-right" as ChatPosition,
      mode: "popup" as ChatMode,
      initialMessage: "Welcome to Aloha! I'm your personal shopping assistant. The more specific you are about what you're looking for, the better I can help you. Feel free to mention details like product type, color, size, style, or price range. What can I help you find today?",
      useVoice: true,
      storeTheme: {
        primaryColor: "#2ECC71",
        secondaryColor: "#FFFFFF",
      }
    }
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  const formData = await request.formData();
  const configData = JSON.parse(formData.get("config") as string);
  
  console.log("Saving Aloha configuration:", configData);
  
  return json({ status: "success" });
};

export default function Index() {
  const { configuration } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const [config, setConfig] = useState({
    ...configuration,
  });
  
  const positionOptions = [
    { label: "Center", value: "center" },
    { label: "Bottom Right", value: "bottom-right" },
    { label: "Bottom Left", value: "bottom-left" }
  ];
  
  const modeOptions = [
    { label: "Popup Overlay", value: "popup" },
    { label: "Embedded in Page", value: "embedded" }
  ];
  
  const handleSave = () => {
    const formData = new FormData();
    formData.append("config", JSON.stringify(config));
    submit(formData, { method: "post" });
  };
  
  return (
    <Page>
      <TitleBar title="Aloha Shopping Assistant" />
      <BlockStack gap="500">
        <Banner
          title="Welcome to Aloha Shopping Assistant!"
          tone="info"
        >
          <p>Configure your AI shopping assistant to help customers find products through natural conversation.</p>
        </Banner>
        
        <Layout>
          
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Display Settings</Text>
                
                <Select
                  label="Assistant Position"
                  options={positionOptions}
                  value={config.position}
                  onChange={(value) => setConfig({ ...config, position: value as ChatPosition })}
                  helpText="Where the assistant button and chat window will appear on your store"
                />
                
                <Select
                  label="Display Mode"
                  options={modeOptions}
                  value={config.mode}
                  onChange={(value) => setConfig({ ...config, mode: value as ChatMode })}
                  helpText="How the assistant will be displayed on your store"
                />
                
                <TextField
                  label="Initial Welcome Message"
                  value={config.initialMessage}
                  onChange={(value) => setConfig({ ...config, initialMessage: value })}
                  multiline={4}
                  helpText="This message will greet customers when they first open the assistant"
                />
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Voice Settings</Text>
                <Checkbox
                  label="Enable voice interactions"
                  checked={config.useVoice}
                  onChange={(checked) => setConfig({ ...config, useVoice: checked })}
                  helpText="Allow customers to speak to the assistant and hear responses (using Eleven Labs)"
                />
                
                {config.useVoice && (
                  <BlockStack gap="200">
                    <Divider />
                    <Text variant="headingSm" as="h3">Voice Pricing</Text>
                    <InlineStack gap="400">
                      <RadioButton
                        label="Basic Voice ($10/month)"
                        checked={true}
                        name="voice-tier"
                      />
                    </InlineStack>
                    <Text variant="bodySm" as="p" color="subdued">
                      Using Eleven Labs Flash/Turbo voices for efficient, natural-sounding responses
                    </Text>
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Theme Settings</Text>
                <Box paddingBlockEnd="200">
                  <Text variant="bodyMd" as="p">Primary Color (Gradient Start)</Text>
                  <input 
                    type="color" 
                    value={config.storeTheme.primaryColor}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      storeTheme: { 
                        ...config.storeTheme, 
                        primaryColor: e.target.value 
                      } 
                    })}
                    style={{ width: "100%", height: "40px" }}
                  />
                </Box>
                
                <Box>
                  <Text variant="bodyMd" as="p">Secondary Color (Gradient End)</Text>
                  <input 
                    type="color" 
                    value={config.storeTheme.secondaryColor}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      storeTheme: { 
                        ...config.storeTheme, 
                        secondaryColor: e.target.value 
                      } 
                    })}
                    style={{ width: "100%", height: "40px" }}
                  />
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Preview Your Assistant</Text>
                <Box padding="400" background="bg-surface-secondary">
                  <ChatPreview config={config} />
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section>
            <Card>
              <BlockStack gap="200">
                <Button variant="primary" onClick={handleSave}>Save Configuration</Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}