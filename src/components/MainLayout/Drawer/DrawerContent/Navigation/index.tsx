import {useEffect, useState} from 'react';

// material-ui
import {Box, Typography} from '@mui/material';

// project import
import menuItems from '../menu-items';

import {useSelector} from '@/store';

import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import { tenantIntegrationService } from '@/services/tenantIntegrationService';

// Partner ID 1 = STC Qitaf (matches partner_id in tenant_partner_integrations table)
const QITAF_PARTNER_ID = 1;

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

const Navigation = () => {
    const {drawerOpen} = useSelector((state) => state.menu);
    const [selectedItems, setSelectedItems] = useState<string | undefined>('');
    const [selectedLevel, setSelectedLevel] = useState<number>(0);
    const user = useSelector((state) => state.user);
    const [qitafEnabled, setQitafEnabled] = useState(false);

    useEffect(() => {
        const raw = localStorage.getItem('client-info');
        if (!raw) return;
        const info = JSON.parse(raw);
        if (!info?.id) return;
        tenantIntegrationService.getByTenant(Number(info.id))
            .then((integrations) => {
                const active = integrations.some(
                    (i) => i.integrationId === QITAF_PARTNER_ID && i.isEnabled,
                );
                setQitafEnabled(active);
            })
            .catch(() => {});
    }, []);

    const navGroups = menuItems.items
        .filter((item) => !item.requiresQitaf || qitafEnabled)
        .filter((item) => item.privileges?.length ? item.privileges.some((privilege) => user?.privileges?.[privilege]) : true).map((item,) => {
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
