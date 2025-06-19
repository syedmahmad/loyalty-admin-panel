import React, {useEffect, useMemo, useRef, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';

// material-ui
import {useTheme} from '@mui/material/styles';
import {alpha, Collapse, List, ListItemButton, ListItemIcon, ListItemText, Popover, Typography,} from '@mui/material';

// project import
import NavItem from './NavItem';
import SimpleBar from '../../../../third-party/SimpleBar';
import {dispatch, useSelector} from '../../../../../store';
import {activeItem} from '../../../../../store/reducers/menu';

// assets
import {BorderOutlined, DownOutlined, UpOutlined} from '@ant-design/icons';

// types
import {NavItemType} from '../../../../../types/menu';

type VirtualElement = {
    getBoundingClientRect: () => ClientRect | DOMRect;
    contextElement?: Element;
};

// ==============================|| NAVIGATION - LIST COLLAPSE ||============================== //

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
                         selectedLevel
                     }: Props) => {
    const theme = useTheme();

    const menuState = useSelector((state) => state.menu);
    const user = useSelector((state) => state.user);

    const {drawerOpen} = menuState;
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [selected, setSelected] = useState<string | null | undefined>(null);
    const [anchorEl, setAnchorEl] = useState<VirtualElement | (() => VirtualElement) | null | undefined>(null);
    const popoverAnchor = useRef(null);

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLDivElement, MouseEvent> | undefined) => {
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

    const handlerIconLink = () => {
        if (!drawerOpen) {
            if (menu.url) router.push(`${menu.url}`);
            setSelected(menu.id);
        }
    };

    const popoverEnter = () => {
        setPopoverOpen(true);
    }

    const popoverLeave = () => {
        setPopoverOpen(false);
    }

    const handleHover = (event: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLDivElement, MouseEvent> | undefined) => {
        setAnchorEl(event?.currentTarget);
        if (!drawerOpen) {
            setSelected(menu.id);
        }
    };

    const miniMenuOpened = Boolean(anchorEl);

    const handleClose = () => {
        setOpen(false);
        if (!miniMenuOpened) {
            if (!menu.url) {
                setSelected(null);
            }
        }
        setAnchorEl(null);
    };

    useMemo(() => {
        if (selected === selectedItems) {
            if (level === 1) {
                setOpen(true);
            }
        } else {
            if (level === selectedLevel) {
                setOpen(false);
                if (!miniMenuOpened && !drawerOpen && !selected) {
                    setSelected(null);
                }
                if (drawerOpen) {
                    setSelected(null);
                }
            }
        }
    }, [selectedItems, level, selected, miniMenuOpened, drawerOpen, selectedLevel]);

    const pathname = usePathname();

    useEffect(() => {
        if (pathname === menu.url) {
            setSelected(menu.id);
        }
        // eslint-disable-next-line
    }, [pathname]);

    const checkOpenForParent = (child: NavItemType[], id: string) => {
        child.forEach((item: NavItemType) => {
            if (item.url === pathname) {
                setOpen(true);
                setSelected(id);
            }
        });
    };

    // menu collapse for sub-levels
    useEffect(() => {
        setOpen(false);
        if (!miniMenuOpened) {
            setSelected(null);
        }
        if (miniMenuOpened) setAnchorEl(null);
        if (menu.children) {
            menu.children.forEach((item: NavItemType) => {
                if (item.children?.length) {
                    checkOpenForParent(item.children, menu.id!);
                }
                if (pathname && pathname.includes('product-details')) {
                    if (item.url && item.url.includes('product-details')) {
                        setSelected(menu.id);
                        setOpen(true);
                    }
                }
                if (item.url === pathname) {
                    setSelected(menu.id);
                    setOpen(true);
                }
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, menu.children]);

    useEffect(() => {
        if (menu.url === pathname) {
            dispatch(activeItem({openItem: [menu.id]}));
            setSelected(menu.id);
            setAnchorEl(null);
            setOpen(true);
        }
    }, [pathname, menu]);

    const navCollapse = menu.children?.filter((item) => item.privileges?.length ? item.privileges.some((privilege) => user?.privileges?.[privilege]) : true).map((item) => {
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
                return <NavItem key={item.id} item={item} level={level + 1}/>;
            default:
                return (
                    <Typography key={item.id} variant="h6" color="error" align="center">
                        Fix - Collapse or Item
                    </Typography>
                );
        }
    });
    const borderIcon = level === 1 ? <BorderOutlined style={{fontSize: '1rem'}}/> : false;
    const Icon = menu.icon!;
    const menuIcon = menu.icon ? <Icon style={{fontSize: drawerOpen ? '1rem' : '1.25rem'}}/> : borderIcon;
    const textColor = 'text.primary';
    const iconSelectedColor = drawerOpen ? theme.palette.text.primary : theme.palette.primary.main;

    return (
        <>
            {
                navCollapse?.length ?
                    <>
                        <ListItemButton
                            disableRipple
                            selected={selected === menu.id}
                            {...(!drawerOpen && {onMouseEnter: popoverEnter, onMouseLeave: popoverLeave})}
                            onClick={handleClick}
                            ref={popoverAnchor}
                            sx={{
                                pl: drawerOpen ? `${level * 28}px` : 1.5,
                                py: !drawerOpen && level === 1 ? 1.25 : 1,
                                ...(drawerOpen && {
                                    '&:hover': {
                                        bgcolor: 'primary.light'
                                    },
                                    '&.Mui-selected': {
                                        bgcolor: 'transparent',
                                        color: iconSelectedColor,
                                        '&:hover': {color: iconSelectedColor, bgcolor: 'transparent'}
                                    }
                                }),
                                ...(!drawerOpen && {
                                    '&:hover': {
                                        bgcolor: 'transparent'
                                    },
                                    '&.Mui-selected': {
                                        '&:hover': {
                                            bgcolor: 'transparent'
                                        },
                                        bgcolor: 'transparent'
                                    }
                                })
                            }}
                        >
                            {menuIcon && (
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
                                            '&:hover': {
                                                bgcolor: 'secondary.light'
                                            }
                                        }),
                                        ...(!drawerOpen &&
                                            selected === menu.id && {
                                                bgcolor: `${alpha(theme.palette.primary.light, 0.1)}`,
                                                '&:hover': {
                                                    bgcolor: `${alpha(theme.palette.primary.light, 0.1)}`,
                                                }
                                            })
                                    }}
                                >
                                    {menuIcon}
                                </ListItemIcon>
                            )}
                            {drawerOpen && (
                                <ListItemText
                                    primary={
                                        <Typography variant="h6" color={selected === menu.id ? 'primary' : textColor}>
                                            {menu.title}
                                        </Typography>
                                    }
                                    secondary={
                                        menu.caption && (
                                            <Typography variant="caption" color="secondary">
                                                {menu.caption}
                                            </Typography>
                                        )
                                    }
                                />
                            )}
                            {drawerOpen && (miniMenuOpened || open ? (
                                <UpOutlined
                                    style={{fontSize: '0.625rem', marginLeft: 1, color: theme.palette.primary.main}}/>
                            ) : (
                                <DownOutlined style={{fontSize: '0.625rem', marginLeft: 1}}/>
                            ))}

                            {!drawerOpen && (
                                <Popover
                                    open={popoverOpen}
                                    anchorEl={popoverAnchor.current}
                                    slotProps={{
                                        paper: {
                                            onMouseEnter: popoverEnter, onMouseLeave: popoverLeave
                                        }
                                    }}
                                    anchorOrigin={{horizontal: 'right', vertical: 'center'}}
                                    sx={{
                                        pointerEvents: 'none',
                                        zIndex: 2001,
                                        '& .MuiPopover-paper': {
                                            pointerEvents: 'auto',
                                        }
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                    onClose={handleClose}
                                    disableRestoreFocus
                                >
                                    <SimpleBar
                                    >
                                        {navCollapse}
                                    </SimpleBar>
                                </Popover>
                            )}
                        </ListItemButton>
                        {drawerOpen && (
                            <Collapse in={open} timeout="auto" unmountOnExit>
                                <List sx={{p: 0}}>{navCollapse}</List>
                            </Collapse>
                        )}
                    </> : <></>
            }
        </>
    );
};

export default NavCollapse;
