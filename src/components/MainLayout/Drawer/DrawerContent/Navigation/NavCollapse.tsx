import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  useTheme,
  alpha,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  Popover,
  Typography,
  Box,
} from '@mui/material';

import NavItem from './NavItem';
import SimpleBar from '../../../../third-party/SimpleBar';
import { dispatch, useSelector } from '../../../../../store';
import { activeItem } from '../../../../../store/reducers/menu';

import {  ChevronRight } from '@mui/icons-material';

import { NavItemType } from '../../../../../types/menu';

type VirtualElement = {
  getBoundingClientRect: () => ClientRect | DOMRect;
  contextElement?: Element;
};

interface Props {
  menu: NavItemType;
  level: number;
  parentId: string;
  setSelectedItems: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedItems: string | undefined;
  setSelectedLevel: React.Dispatch<React.SetStateAction<number>>;
  selectedLevel: number;
}

const NavCollapse = ({
  menu,
  level,
  parentId,
  setSelectedItems,
  selectedItems,
  setSelectedLevel,
  selectedLevel,
}: Props) => {
  const theme = useTheme();
  const menuState = useSelector((state) => state.menu);
  const user = useSelector((state) => state.user);

  const { drawerOpen } = menuState;
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selected, setSelected] = useState<string | null | undefined>(null);
  const [anchorEl, setAnchorEl] = useState<VirtualElement | null>(null);
  const popoverAnchor = useRef(null);

  const pathname = usePathname();
  const miniMenuOpened = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(null);
    setSelectedLevel(level);
    if (drawerOpen) {
      setOpen(!open);
      setSelected(!selected ? menu.id : null);
      setSelectedItems(!selected ? menu.id : '');
      if (menu.url) router.push(`${menu.url}`);
    } else {
      setAnchorEl(event?.currentTarget);
    }
  };

  const handleHover = (event: any) => {
    setAnchorEl(event?.currentTarget);
    if (!drawerOpen) {
      setSelected(menu.id);
    }
  };

  const handlePopoverEnter = () => setPopoverOpen(true);
  const handlePopoverLeave = () => setPopoverOpen(false);
  const handleClose = () => {
    setOpen(false);
    if (!miniMenuOpened) setSelected(null);
    setAnchorEl(null);
  };

  const handlerIconLink = () => {
    if (!drawerOpen) {
      if (menu.url) router.push(`${menu.url}`);
      setSelected(menu.id);
    }
  };

  useMemo(() => {
    if (selected === selectedItems && level === 1) {
      setOpen(true);
    } else if (level === selectedLevel) {
      setOpen(false);
      if (!miniMenuOpened && !drawerOpen && !selected) {
        setSelected(null);
      }
      if (drawerOpen) setSelected(null);
    }
  }, [selectedItems, level, selected, miniMenuOpened, drawerOpen, selectedLevel]);

  useEffect(() => {
    if (pathname === menu.url) {
      setSelected(menu.id);
      dispatch(activeItem({ openItem: [menu.id] }));
    }
  }, [pathname, menu]);

  useEffect(() => {
    if (menu.children) {
      menu.children.forEach((item: NavItemType) => {
        if (item.url === pathname) {
          setSelected(menu.id);
          setOpen(true);
        }
      });
    }
  }, [pathname, menu.children]);

  const navCollapse = menu.children
    ?.filter((item) =>
      item.privileges?.length ? item.privileges.some((p) => user?.privileges?.[p]) : true
    )
    .map((item) => {
      switch (item.type) {
        case 'collapse':
          return (
            <NavCollapse
              key={item.id}
              setSelectedItems={setSelectedItems}
              setSelectedLevel={setSelectedLevel}
              selectedLevel={selectedLevel}
              selectedItems={selectedItems}
              menu={item}
              level={level + 1}
              parentId={parentId}
            />
          );
        case 'item':
          return <NavItem key={item.id} item={item} level={level + 1} />;
        default:
          return (
            <Typography key={item.id} variant="h6" color="error" align="center">
              Fix - Collapse or Item
            </Typography>
          );
      }
    });

  const Icon = menu.icon!;
  const textColor = 'text.primary';
  const iconSelectedColor = drawerOpen ? theme.palette.text.primary : theme.palette.primary.main;

  return navCollapse?.length ? (
    <>
      <ListItemButton
        disableRipple
        selected={selected === menu.id}
        onMouseEnter={!drawerOpen ? handlePopoverEnter : undefined}
        onMouseLeave={!drawerOpen ? handlePopoverLeave : undefined}
        onClick={handleClick}
        ref={popoverAnchor}
        sx={{
          pl: drawerOpen ? `${level * 28}px` : 1.5,
          py: !drawerOpen && level === 1 ? 1.25 : 1,
          ...(drawerOpen && {
            '&:hover': { bgcolor: 'primary.light' },
            '&.Mui-selected': {
              bgcolor: 'transparent',
              color: iconSelectedColor,
              '&:hover': { color: iconSelectedColor, bgcolor: 'transparent' },
            },
          }),
          ...(!drawerOpen && {
            '&:hover': { bgcolor: 'transparent' },
            '&.Mui-selected': {
              '&:hover': { bgcolor: 'transparent' },
              bgcolor: 'transparent',
            },
          }),
        }}
      >
        <ListItemIcon
          onClick={handlerIconLink}
          sx={{
            minWidth: 28,
            color: selected === menu.id ? 'primary.main' : textColor,
            ...(!drawerOpen && {
              borderRadius: 1.5,
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': { bgcolor: 'secondary.light' },
            }),
            ...(!drawerOpen &&
              selected === menu.id && {
                bgcolor: `${alpha(theme.palette.primary.light, 0.1)}`,
                '&:hover': {
                  bgcolor: `${alpha(theme.palette.primary.light, 0.1)}`,
                },
              }),
          }}
        >
          <Icon style={{ fontSize: drawerOpen ? '1rem' : '1.25rem' }} />
        </ListItemIcon>

        {drawerOpen && (
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Typography
              variant="h6"
              sx={{
                color: selected === menu.id ? iconSelectedColor : textColor,
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 450,
                fontStyle: 'normal',
                fontSize: '18px',
                lineHeight: '22px',
              }}
            >
              {menu.title}
            </Typography>
            <ChevronRight
              sx={{
                fontSize: '20px',
                color: textColor,
                transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </Box>
        )}

        {!drawerOpen && (
          <Popover
            open={popoverOpen}
            anchorEl={popoverAnchor.current}
            slotProps={{
              paper: {
                onMouseEnter: handlePopoverEnter,
                onMouseLeave: handlePopoverLeave,
              },
            }}
            anchorOrigin={{ horizontal: 'right', vertical: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            sx={{
              pointerEvents: 'none',
              zIndex: 2001,
              '& .MuiPopover-paper': {
                pointerEvents: 'auto',
              },
            }}
            onClose={handleClose}
            disableRestoreFocus
          >
            <SimpleBar>{navCollapse}</SimpleBar>
          </Popover>
        )}
      </ListItemButton>

      {drawerOpen && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List sx={{ p: 0 }}>{navCollapse}</List>
        </Collapse>
      )}
    </>
  ) : null;
};

export default NavCollapse;
