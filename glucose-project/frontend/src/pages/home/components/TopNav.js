import {FaSun, FaMoon} from "react-icons/fa";
import {MdTextFields} from "react-icons/md";
import {Link} from "react-router-dom";
import {Navbar, Nav, Container} from "react-bootstrap";
import "./css/TopNav.css";
import lightLogo from "../../../assets/wellDang.png";
import darkLogo from "../../../assets/wellDang-darkmode.png";

export default function TopNav({state, setState}) {
    const logoSrc = state.dark ? darkLogo : lightLogo;
    return (
        <header className="topnav-bar">
            <Navbar  expand="lg" style={{ background: "var(--nav-bg)" }}>
                <Container>
                    {/* 왼쪽 로고 */}
                    <Navbar.Brand as={Link} to="/">
                        <img
                            src={logoSrc}
                            alt="오당탕탕 로고"
                            style={{ height: "50px", transition: "filter 0.3s ease" }}
                        />
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        {/* 왼쪽 Nav */}
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/">홈</Nav.Link>
                            <Nav.Link as={Link} to="/marketDetail">마켓상세</Nav.Link>
                            <Nav.Link as={Link} to="/exerciseDetail">운동상세</Nav.Link>

                            {state.profile?.userId && (
                                <>
                                    <Nav.Link as={Link} to="/mypage">월간 레포트</Nav.Link>
                                    <Nav.Link as={Link} to="/guardianPage" style={{ color: "green" }}>
                                        보호자용 페이지
                                    </Nav.Link>
                                </>
                            )}
                        </Nav>

                        {/* ✅ 오른쪽 Nav */}
                        {state.profile?.userId && (
                            <Nav className="ms-auto">
                                <Nav.Link
                                    as={Link}
                                    to="/userDetail"
                                    className="fw-bold"
                                    style={{
                                        color: "#0f766e",
                                        fontWeight: "600",
                                        marginRight: "16px",
                                    }}
                                >
                                    마이페이지
                                </Nav.Link>
                            </Nav>
                        )}

                        {/* 오른쪽 토글 */}
                        <div className="d-flex align-items-center gap-4">
                            {/* 글씨 크기 토글 */}
                            <div className="d-flex align-items-center gap-1">
                                <MdTextFields style={{ color: "black" }} />
                                <div className="form-check form-switch m-0">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={state.big}
                                        onChange={(e) =>
                                            setState((s) => ({ ...s, big: e.target.checked }))
                                        }
                                    />
                                </div>
                            </div>

                            {/* 다크모드 토글 */}
                            <div className="d-flex align-items-center gap-1">
                                <FaSun style={{ color: "black" }} />
                                <FaMoon style={{ color: "black" }} />
                                <div className="form-check form-switch m-0">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={state.dark}
                                        onChange={(e) =>
                                            setState((s) => ({ ...s, dark: e.target.checked }))
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </Navbar.Collapse>

                </Container>
            </Navbar>
        </header>

    );
}
