import {useState} from 'react';

// material-ui
import {Box, Typography} from '@mui/material';

// project import
import menuItems from '../menu-items';

import {useSelector} from '@/store';

import NavItem from './NavItem';
import NavCollapse from './NavCollapse';

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

const Navigation = () => {
    const {drawerOpen} = useSelector((state) => state.menu);
    const [selectedItems, setSelectedItems] = useState<string | undefined>('');
    const [selectedLevel, setSelectedLevel] = useState<number>(0);
    const user = useSelector((state) => state.user);

    const navGroups = menuItems.items.filter((item) => item.privileges?.length ? item.privileges.some((privilege) => user?.privileges?.[privilege]) : true).map((item,) => {
        switch (item.type) {
            case 'collapse':
                return (
                    <NavCollapse
                        key={item.id}
                        menu={item}
                        level={1}
                        parentId={item.id!}
                        setSelectedItems={setSelectedItems}
                        setSelectedLevel={setSelectedLevel}
                        selectedLevel={selectedLevel}
                        selectedItems={selectedItems}
                    />
                );
            case 'item':
                return <NavItem key={item.id} item={item} level={1}/>;
            default:
                return (
                    <Typography key={item.id} variant="h6" color="error" align="center">
                        Menu Items Error
                    </Typography>
                );
        }
    });
    return (
        <Box
            sx={{
                pt: drawerOpen ? 2 : 0,
                '& > ul:first-of-type': {mt: 0},
                display: 'block'
            }}
        >
            {navGroups}
        </Box>
    );
};

export default Navigation;
