import React, { useState } from "react";
import { TabItem, TabList, TabsComponentStyle } from "./style";
import { TabItemModel, TabsProps } from "./model";
import { BodyPrimaryRegular } from "../typing";
import { Theme } from "~/app/theme";

const TabsComponent: React.FC<TabsProps> = (props) => {
  const { tabList, initialTabId, variant, width, alignment } = props;
  const [activeTab, setActiveTab] = useState<string>(
    initialTabId ?? tabList[0].id
  );

  const updateTab = (tab: TabItemModel) => {
    setActiveTab(tab.id);
  };

  return (
    <TabsComponentStyle variant={variant} width={width} alignment={alignment}>
      <TabList>
        {tabList.map((tabItem) => (
          <TabItem
            key={tabItem.id}
            isActive={activeTab === tabItem.id}
            onClick={() => updateTab(tabItem)}
          >
            <BodyPrimaryRegular
              color={
                activeTab === tabItem.id
                  ? Theme.text.primaryInverse
                  : Theme.text.tertiary
              }
            >
              {tabItem.label}
            </BodyPrimaryRegular>
          </TabItem>
        ))}
      </TabList>
    </TabsComponentStyle>
  );
};

export default React.memo(TabsComponent);
