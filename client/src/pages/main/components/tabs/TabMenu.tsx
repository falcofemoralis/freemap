import MailIcon from '@mui/icons-material/Mail';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import { Divider, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react';
import { DRAWER_WIDTH } from './index';
import { TabAdmin } from './TabAdmin';

interface TabMenuProps {
    open: boolean;
    onClose: () => void;
}

export const TabMenu: React.FC<TabMenuProps> = ({ open, onClose }) => {
    console.log('TabMenu');

    return (
        <>
            <Drawer
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': { width: DRAWER_WIDTH, p: 3 }
                }}
                anchor='left'
                open={open}
                onClose={onClose}
            >
                <List>
                    {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
                        <ListItem button key={text}>
                            <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItem>
                    ))}
                </List>
                <Divider />
                <List>
                    {['All mail', 'Trash', 'Spam'].map((text, index) => (
                        <ListItem button key={text}>
                            <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <TabAdmin />
        </>
    );
};
